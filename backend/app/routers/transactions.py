from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import TransactionResponse
from app.services import inventory as inventory_service

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionResponse])
def read_transactions(
    item_id: Optional[int] = Query(None, description="Filter by item ID"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type (ISSUE, RETURN)"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve audit log of stock movements (issue and return history)."""
    txns = inventory_service.get_transactions(
        db=db,
        item_id=item_id,
        transaction_type=transaction_type,
        limit=limit,
    )
    # Populate item_name and item_sku for enriched UI response
    result = []
    for t in txns:
        res = TransactionResponse(
            id=t.id,
            item_id=t.item_id,
            transaction_type=t.transaction_type,
            quantity=t.quantity,
            notes=t.notes,
            created_at=t.created_at,
            item_name=t.item.name if t.item else None,
            item_sku=t.item.sku if t.item else None,
        )
        result.append(res)
    return result
