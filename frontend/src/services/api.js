/**
 * CampusStock Centralized API Service Layer
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with JSON serialization and robust error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || `HTTP error ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API request failed [${config.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

// --- Item Services ---

export async function getItems(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.category_id) query.append('category_id', params.category_id);
  if (params.status) query.append('status', params.status);
  if (params.low_stock) query.append('low_stock', 'true');
  if (params.skip) query.append('skip', params.skip);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/items${qs}`);
}

export async function getItem(id) {
  return request(`/items/${id}`);
}

export async function createItem(itemData) {
  return request('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

export async function updateItem(id, itemData) {
  return request(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
}

export async function deleteItem(id) {
  return request(`/items/${id}`, {
    method: 'DELETE',
  });
}

export async function issueItem(id, data) {
  return request(`/items/${id}/issue`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function returnItem(id, data) {
  return request(`/items/${id}/return`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Category Services ---

export async function getCategories() {
  return request('/categories');
}

export async function createCategory(categoryData) {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
}

export async function deleteCategory(id) {
  return request(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// --- Statistics & Transactions ---

export async function getStats() {
  return request('/stats');
}

export async function getTransactions(params = {}) {
  const query = new URLSearchParams();
  if (params.item_id) query.append('item_id', params.item_id);
  if (params.transaction_type) query.append('transaction_type', params.transaction_type);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/transactions${qs}`);
}

// --- Health ---
export async function getHealth() {
  return fetch('/health').then((res) => res.json());
}
