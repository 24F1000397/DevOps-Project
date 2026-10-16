from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    description: Optional[str] = Field(None, description="Category description")


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Item Schemas
class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Item name (e.g. Dell Latitude 5420)")
    sku: str = Field(..., min_length=1, max_length=50, description="Unique stock keeping unit")
    category_id: Optional[int] = Field(None, description="Associated category ID")
    description: Optional[str] = Field(None, description="Item details, model, specifications")
    quantity: int = Field(0, ge=0, description="Total stock quantity owned by campus")
    available_quantity: Optional[int] = Field(None, ge=0, description="Currently available stock for checkout")
    minimum_stock: int = Field(5, ge=0, description="Low stock threshold for alerts")
    location: Optional[str] = Field(None, max_length=100, description="Storage room, lab, or shelf location")


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    category_id: Optional[int] = None
    description: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    available_quantity: Optional[int] = Field(None, ge=0)
    minimum_stock: Optional[int] = Field(None, ge=0)
    location: Optional[str] = None
    status: Optional[str] = None


class ItemResponse(ItemBase):
    id: int
    available_quantity: int
    status: str
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


# Stock Transactions & Operations
class StockOperationRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Positive quantity to issue or return")
    notes: Optional[str] = Field(None, max_length=255, description="Issued to student/staff ID, room, or return reason")


class TransactionResponse(BaseModel):
    id: int
    item_id: int
    transaction_type: str
    quantity: int
    notes: Optional[str] = None
    created_at: datetime
    item_name: Optional[str] = None
    item_sku: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# System Statistics Schema
class InventoryStatsResponse(BaseModel):
    total_items: int = Field(..., description="Unique item models registered")
    total_quantity: int = Field(..., description="Sum of all units owned")
    available_stock: int = Field(..., description="Sum of all available units")
    issued_items: int = Field(..., description="Sum of all currently issued units")
    low_stock_items: int = Field(..., description="Items where available <= minimum_stock and available > 0")
    out_of_stock_items: int = Field(..., description="Items where available == 0")
    categories_count: int = Field(..., description="Total categories configured")
