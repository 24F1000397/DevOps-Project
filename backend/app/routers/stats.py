from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import InventoryStatsResponse
from app.services import inventory as inventory_service

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("", response_model=InventoryStatsResponse)
def read_inventory_stats(db: Session = Depends(get_db)):
    """Retrieve real-time aggregate statistics for dashboard metrics."""
    return inventory_service.get_inventory_stats(db=db)
