/**
 * Centralized API client with credentials support and typed helpers
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any;
}

export const TOKEN_STORAGE_KEY = 'brightsmile_admin_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure HTTP-only cookies are passed
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `HTTP ${response.status}: Request failed`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
