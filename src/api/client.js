const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = new Error('API request failed');
    error.status = response.status;
    error.info = await response.text();
    throw error;
  }

  return response.json();
}

export const apiClient = {
  get(path) {
    return request(path, { method: 'GET' });
  },
  post(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
  },
  put(path, body) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete(path) {
    return request(path, { method: 'DELETE' });
  }
};
