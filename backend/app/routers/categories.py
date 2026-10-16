from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CategoryCreate, CategoryResponse
from app.services import inventory as inventory_service

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def read_categories(db: Session = Depends(get_db)):
    """Retrieve all asset categories."""
    return inventory_service.get_categories(db=db)


@router.get("/{category_id}", response_model=CategoryResponse)
def read_category(category_id: int, db: Session = Depends(get_db)):
    """Retrieve a single category by ID."""
    return inventory_service.get_category(db=db, category_id=category_id)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new asset category (e.g. Laptops, Projectors, Networking)."""
    return inventory_service.create_category(
        db=db,
        name=category_in.name,
        description=category_in.description,
    )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category."""
    inventory_service.delete_category(db=db, category_id=category_id)
    return None
