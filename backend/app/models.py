from datetime import datetime
from enum import Enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class TransactionType(str, Enum):
    ISSUE = "ISSUE"
    RETURN = "RETURN"


class ItemStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    LOW_STOCK = "LOW_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    items = relationship("Item", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name='{self.name}')>"


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    description = Column(Text, nullable=True)
    quantity = Column(Integer, default=0, nullable=False)
    available_quantity = Column(Integer, default=0, nullable=False)
    minimum_stock = Column(Integer, default=5, nullable=False)
    location = Column(String(100), nullable=True)
    status = Column(String(30), default=ItemStatus.AVAILABLE.value, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="chk_item_quantity_non_negative"),
        CheckConstraint("available_quantity >= 0", name="chk_item_available_quantity_non_negative"),
        CheckConstraint("available_quantity <= quantity", name="chk_item_available_lte_quantity"),
        CheckConstraint("minimum_stock >= 0", name="chk_item_minimum_stock_non_negative"),
    )

    # Relationships
    category = relationship("Category", back_populates="items")
    transactions = relationship("Transaction", back_populates="item", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Item(id={self.id}, name='{self.name}', sku='{self.sku}', available={self.available_quantity}/{self.quantity})>"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type = Column(String(20), nullable=False)  # ISSUE or RETURN
    quantity = Column(Integer, nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_transaction_quantity_positive"),
    )

    # Relationships
    item = relationship("Item", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, item_id={self.item_id}, type='{self.transaction_type}', qty={self.quantity})>"
