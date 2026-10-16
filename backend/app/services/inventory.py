from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models import Item, Category, Transaction, ItemStatus, TransactionType
from app.schemas import ItemCreate, ItemUpdate


def compute_item_status(available_qty: int, min_stock: int) -> str:
    """Calculates stock status based on available units and threshold."""
    if available_qty <= 0:
        return ItemStatus.OUT_OF_STOCK.value
    elif available_qty <= min_stock:
        return ItemStatus.LOW_STOCK.value
    return ItemStatus.AVAILABLE.value


def get_items(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    item_status: Optional[str] = None,
    low_stock_only: bool = False,
    skip: int = 0,
    limit: int = 100,
) -> List[Item]:
    """Retrieve items with optional filtering by name, SKU, category, and stock status."""
    query = db.query(Item)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Item.name.ilike(search_filter),
                Item.sku.ilike(search_filter),
                Item.description.ilike(search_filter),
                Item.location.ilike(search_filter),
            )
        )

    if category_id is not None:
        query = query.filter(Item.category_id == category_id)

    if item_status:
        query = query.filter(Item.status == item_status.upper())

    if low_stock_only:
        query = query.filter(Item.available_quantity <= Item.minimum_stock)

    return query.order_by(Item.id.desc()).offset(skip).limit(limit).all()


def get_item(db: Session, item_id: int) -> Item:
    """Retrieve a single item by ID or raise 404."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} not found",
        )
    return item


def get_item_by_sku(db: Session, sku: str) -> Optional[Item]:
    """Retrieve an item by SKU if exists."""
    return db.query(Item).filter(Item.sku == sku.strip()).first()


def create_item(db: Session, item_in: ItemCreate) -> Item:
    """Create a new campus inventory item with SKU uniqueness and status checks."""
    existing_item = get_item_by_sku(db, item_in.sku)
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An item with SKU '{item_in.sku}' already exists",
        )

    # Check category existence if provided
    if item_in.category_id is not None:
        cat = db.query(Category).filter(Category.id == item_in.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category ID {item_in.category_id} does not exist",
            )

    # Set available quantity default to total quantity if not explicitly provided
    available = item_in.available_quantity if item_in.available_quantity is not None else item_in.quantity
    if available > item_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Available quantity cannot exceed total quantity",
        )

    item_status = compute_item_status(available, item_in.minimum_stock)

    db_item = Item(
        name=item_in.name.strip(),
        sku=item_in.sku.strip().upper(),
        category_id=item_in.category_id,
        description=item_in.description,
        quantity=item_in.quantity,
        available_quantity=available,
        minimum_stock=item_in.minimum_stock,
        location=item_in.location,
        status=item_status,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, item_id: int, item_in: ItemUpdate) -> Item:
    """Update item details, recalculating stock status and maintaining constraints."""
    db_item = get_item(db, item_id)

    # If updating SKU, check for collision
    if item_in.sku is not None and item_in.sku.strip().upper() != db_item.sku:
        existing = get_item_by_sku(db, item_in.sku)
        if existing and existing.id != item_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An item with SKU '{item_in.sku}' already exists",
            )
        db_item.sku = item_in.sku.strip().upper()

    # If updating category, verify existence
    if item_in.category_id is not None:
        cat = db.query(Category).filter(Category.id == item_in.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category ID {item_in.category_id} does not exist",
            )
        db_item.category_id = item_in.category_id

    if item_in.name is not None:
        db_item.name = item_in.name.strip()
    if item_in.description is not None:
        db_item.description = item_in.description
    if item_in.location is not None:
        db_item.location = item_in.location

    # Handle quantity and available_quantity updates
    new_quantity = item_in.quantity if item_in.quantity is not None else db_item.quantity
    new_available = item_in.available_quantity if item_in.available_quantity is not None else db_item.available_quantity
    new_min_stock = item_in.minimum_stock if item_in.minimum_stock is not None else db_item.minimum_stock

    if new_available > new_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Available quantity cannot exceed total quantity",
        )
    if new_available < 0 or new_quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantities cannot be negative",
        )

    db_item.quantity = new_quantity
    db_item.available_quantity = new_available
    db_item.minimum_stock = new_min_stock
    db_item.status = compute_item_status(new_available, new_min_stock)

    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int) -> None:
    """Delete an item and cascade dependent records."""
    db_item = get_item(db, item_id)
    db.delete(db_item)
    db.commit()


# --- Category Services ---

def get_categories(db: Session) -> List[Category]:
    """Retrieve all categories ordered by name."""
    return db.query(Category).order_by(Category.name.asc()).all()


def get_category(db: Session, category_id: int) -> Category:
    """Retrieve category by ID or raise 404."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found",
        )
    return category


def create_category(db: Session, name: str, description: Optional[str] = None) -> Category:
    """Create a new equipment/asset category."""
    clean_name = name.strip()
    existing = db.query(Category).filter(Category.name.ilike(clean_name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category '{clean_name}' already exists",
        )

    db_category = Category(name=clean_name, description=description)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int) -> None:
    """Delete a category and dissociate linked items."""
    db_category = get_category(db, category_id)
    db.delete(db_category)
    db.commit()


# --- Stock Issue & Return Operations ---

def issue_item(db: Session, item_id: int, quantity: int, notes: Optional[str] = None) -> Transaction:
    """
    Issue stock units for an item.
    Decreases available_quantity, checks availability, and creates an ISSUE transaction.
    """
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue quantity must be greater than zero",
        )

    db_item = get_item(db, item_id)

    if db_item.available_quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot issue {quantity} units. Only {db_item.available_quantity} available in stock",
        )

    # Decrease available stock
    db_item.available_quantity -= quantity
    db_item.status = compute_item_status(db_item.available_quantity, db_item.minimum_stock)

    # Record audit transaction
    txn = Transaction(
        item_id=item_id,
        transaction_type=TransactionType.ISSUE.value,
        quantity=quantity,
        notes=notes,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


def return_item(db: Session, item_id: int, quantity: int, notes: Optional[str] = None) -> Transaction:
    """
    Return previously issued stock units.
    Increases available_quantity up to total quantity and creates a RETURN transaction.
    """
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return quantity must be greater than zero",
        )

    db_item = get_item(db, item_id)

    if db_item.available_quantity + quantity > db_item.quantity:
        max_returnable = db_item.quantity - db_item.available_quantity
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot return {quantity} units. At most {max_returnable} units are currently checked out",
        )

    # Increase available stock
    db_item.available_quantity += quantity
    db_item.status = compute_item_status(db_item.available_quantity, db_item.minimum_stock)

    # Record audit transaction
    txn = Transaction(
        item_id=item_id,
        transaction_type=TransactionType.RETURN.value,
        quantity=quantity,
        notes=notes,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


# --- Transactions History & Statistics ---

def get_transactions(
    db: Session,
    item_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    limit: int = 100,
) -> List[Transaction]:
    """Retrieve audit transactions log with optional item or type filters."""
    query = db.query(Transaction)
    if item_id is not None:
        query = query.filter(Transaction.item_id == item_id)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type.upper())
    return query.order_by(Transaction.id.desc()).limit(limit).all()


def get_inventory_stats(db: Session) -> dict:
    """Compute real-time inventory aggregated metrics."""
    items = db.query(Item).all()
    categories_count = db.query(Category).count()

    total_items = len(items)
    total_quantity = sum(item.quantity for item in items)
    available_stock = sum(item.available_quantity for item in items)
    issued_items = total_quantity - available_stock
    low_stock_items = sum(1 for item in items if 0 < item.available_quantity <= item.minimum_stock)
    out_of_stock_items = sum(1 for item in items if item.available_quantity == 0)

    return {
        "total_items": total_items,
        "total_quantity": total_quantity,
        "available_stock": available_stock,
        "issued_items": issued_items,
        "low_stock_items": low_stock_items,
        "out_of_stock_items": out_of_stock_items,
        "categories_count": categories_count,
    }
