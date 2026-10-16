def test_create_category(client):
    """Test creating a new category via POST /api/categories."""
    payload = {
        "name": "Audio Visual",
        "description": "Projectors, microphones, and speakers",
    }
    response = client.post("/api/categories", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Audio Visual"
    assert data["description"] == "Projectors, microphones, and speakers"
    assert "id" in data


def test_get_categories_list(client, sample_category):
    """Test retrieving categories list via GET /api/categories."""
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(c["id"] == sample_category.id for c in data)


def test_create_duplicate_category_fails(client, sample_category):
    """Test creating duplicate category returns 409 conflict."""
    payload = {"name": sample_category.name, "description": "Duplicate attempt"}
    response = client.post("/api/categories", json=payload)
    assert response.status_code == 409


def test_delete_category(client, sample_category):
    """Test deleting category via DELETE /api/categories/{id}."""
    response = client.delete(f"/api/categories/{sample_category.id}")
    assert response.status_code == 204

    # Verify category is deleted
    get_response = client.get(f"/api/categories/{sample_category.id}")
    assert get_response.status_code == 404
