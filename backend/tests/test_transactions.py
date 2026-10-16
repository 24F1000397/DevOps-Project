def test_issue_item_decreases_available_quantity(client, sample_item):
    """Test issuing stock decreases available units and creates audit transaction."""
    initial_avail = sample_item.available_quantity
    payload = {"quantity": 3, "notes": "Issued to CS Faculty Dr. Sharma"}

    response = client.post(f"/api/items/{sample_item.id}/issue", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_type"] == "ISSUE"
    assert data["quantity"] == 3
    assert data["item_id"] == sample_item.id

    # Verify item available_quantity was reduced
    item_res = client.get(f"/api/items/{sample_item.id}")
    assert item_res.status_code == 200
    assert item_res.json()["available_quantity"] == initial_avail - 3


def test_issue_more_than_available_fails(client, sample_item):
    """Test issuing more units than currently available returns 400."""
    payload = {"quantity": 100, "notes": "Excessive request"}
    response = client.post(f"/api/items/{sample_item.id}/issue", json=payload)
    assert response.status_code == 400


def test_issue_negative_or_zero_quantity_fails(client, sample_item):
    """Test issuing 0 or negative units returns 422 or 400."""
    payload = {"quantity": 0, "notes": "Invalid zero"}
    response = client.post(f"/api/items/{sample_item.id}/issue", json=payload)
    assert response.status_code in (400, 422)


def test_return_item_increases_available_quantity(client, sample_item):
    """Test returning issued stock increases available units."""
    # First issue 4 units
    client.post(f"/api/items/{sample_item.id}/issue", json={"quantity": 4})

    # Return 2 units
    payload = {"quantity": 2, "notes": "Returned by student"}
    response = client.post(f"/api/items/{sample_item.id}/return", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_type"] == "RETURN"
    assert data["quantity"] == 2

    # Verify available stock is now initial (10) - 4 + 2 = 8
    item_res = client.get(f"/api/items/{sample_item.id}")
    assert item_res.json()["available_quantity"] == 8


def test_return_more_than_checked_out_fails(client, sample_item):
    """Test returning more units than were checked out returns 400."""
    # Available is currently 10, total is 10. Returning 1 more unit is invalid
    payload = {"quantity": 1, "notes": "Ghost return"}
    response = client.post(f"/api/items/{sample_item.id}/return", json=payload)
    assert response.status_code == 400


def test_get_transactions_log(client, sample_item):
    """Test GET /api/transactions retrieves recorded audit events."""
    # Execute an issue
    client.post(f"/api/items/{sample_item.id}/issue", json={"quantity": 1, "notes": "Lab practical"})

    response = client.get("/api/transactions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["item_id"] == sample_item.id


def test_get_inventory_stats(client, sample_item):
    """Test GET /api/stats returns valid aggregated inventory figures."""
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_items" in data
    assert "total_quantity" in data
    assert "available_stock" in data
    assert "issued_items" in data
    assert "low_stock_items" in data
    assert "categories_count" in data
    assert data["total_items"] >= 1
    assert data["total_quantity"] >= 10
