import { apiClient } from './client';

export async function apiRequest(path, options = {}) {
  return apiClient.get(path, options);
}

export async function apiPost(path, body) {
  return apiClient.post(path, body);
}

export async function apiPut(path, body) {
  return apiClient.put(path, body);
}

export async function apiDelete(path) {
  return apiClient.delete(path);
}
