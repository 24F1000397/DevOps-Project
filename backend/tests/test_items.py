def test_create_item_success(client, sample_category):
    """Test creating an item with full schema via POST /api/items."""
    payload = {
        "name": "Epson 4K Projector",
        "sku": "PRJ-EPS-001",
        "category_id": sample_category.id,
        "quantity": 5,
        "available_quantity": 5,
        "minimum_stock": 1,
        "location": "Seminar Hall B",
        "description": "Ceiling mounted 4K laser projector",
    }
    response = client.post("/api/items", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Epson 4K Projector"
    assert data["sku"] == "PRJ-EPS-001"
    assert data["quantity"] == 5
    assert data["available_quantity"] == 5
    assert data["status"] == "AVAILABLE"
    assert data["category"]["name"] == sample_category.name


def test_create_item_duplicate_sku_fails(client, sample_item):
    """Test creating item with existing SKU returns 409 conflict."""
    payload = {
        "name": "Duplicate Model",
        "sku": sample_item.sku,
        "quantity": 2,
    }
    response = client.post("/api/items", json=payload)
    assert response.status_code == 409


def test_create_item_available_gt_quantity_fails(client):
    """Test creating item where available_quantity > quantity returns 400."""
    payload = {
        "name": "Invalid Item",
        "sku": "INV-SKU-001",
        "quantity": 5,
        "available_quantity": 10,
    }
    response = client.post("/api/items", json=payload)
    assert response.status_code == 400


def test_get_items_list_and_search(client, sample_item):
    """Test GET /api/items with search and query parameters."""
    response = client.get("/api/items", params={"search": "Dell"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["sku"] == sample_item.sku


def test_get_single_item(client, sample_item):
    """Test GET /api/items/{id} returns item details."""
    response = client.get(f"/api/items/{sample_item.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_item.id
    assert data["name"] == sample_item.name


def test_get_item_not_found(client):
    """Test GET /api/items/99999 returns 404."""
    response = client.get("/api/items/99999")
    assert response.status_code == 404


def test_update_item(client, sample_item):
    """Test PUT /api/items/{id} updates fields and recalculates status."""
    payload = {
        "name": "Dell Latitude 5420 (Updated)",
        "location": "Room 205 Lab",
    }
    response = client.put(f"/api/items/{sample_item.id}", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Dell Latitude 5420 (Updated)"
    assert data["location"] == "Room 205 Lab"


def test_delete_item(client, sample_item):
    """Test DELETE /api/items/{id} removes the item."""
    response = client.delete(f"/api/items/{sample_item.id}")
    assert response.status_code == 204

    check = client.get(f"/api/items/{sample_item.id}")
    assert check.status_code == 404
