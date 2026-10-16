from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    ItemCreate,
    ItemUpdate,
    ItemResponse,
    StockOperationRequest,
    TransactionResponse,
)
from app.services import inventory as inventory_service

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("", response_model=List[ItemResponse])
def read_items(
    search: Optional[str] = Query(None, description="Search by name, SKU, or location"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    item_status: Optional[str] = Query(None, alias="status", description="Filter by status (AVAILABLE, LOW_STOCK, OUT_OF_STOCK)"),
    low_stock: bool = Query(False, description="Filter items at or below minimum stock threshold"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve list of inventory items with optional search and filters."""
    return inventory_service.get_items(
        db=db,
        search=search,
        category_id=category_id,
        item_status=item_status,
        low_stock_only=low_stock,
        skip=skip,
        limit=limit,
    )


@router.get("/{item_id}", response_model=ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    """Retrieve a single item by ID."""
    return inventory_service.get_item(db=db, item_id=item_id)


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_new_item(item_in: ItemCreate, db: Session = Depends(get_db)):
    """Register a new item in campus inventory."""
    return inventory_service.create_item(db=db, item_in=item_in)


@router.put("/{item_id}", response_model=ItemResponse)
def update_existing_item(
    item_id: int,
    item_in: ItemUpdate,
    db: Session = Depends(get_db),
):
    """Update details, quantities, or threshold of an existing inventory item."""
    return inventory_service.update_item(db=db, item_id=item_id, item_in=item_in)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an item and its associated history."""
    inventory_service.delete_item(db=db, item_id=item_id)
    return None


@router.post("/{item_id}/issue", response_model=TransactionResponse, status_code=status.HTTP_200_OK)
def issue_item_units(
    item_id: int,
    operation: StockOperationRequest,
    db: Session = Depends(get_db),
):
    """Issue inventory units to student, faculty, or lab department."""
    return inventory_service.issue_item(
        db=db,
        item_id=item_id,
        quantity=operation.quantity,
        notes=operation.notes,
    )


@router.post("/{item_id}/return", response_model=TransactionResponse, status_code=status.HTTP_200_OK)
def return_item_units(
    item_id: int,
    operation: StockOperationRequest,
    db: Session = Depends(get_db),
):
    """Return checked-out inventory units back into available stock."""
    return inventory_service.return_item(
        db=db,
        item_id=item_id,
        quantity=operation.quantity,
        notes=operation.notes,
    )
