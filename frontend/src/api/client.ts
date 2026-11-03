import axios from 'axios';

// Hosting platforms may supply a bare host name (e.g. Render's `host` property); add https:// then.
function apiBase(value: string | undefined): string {
  const url = (value ?? 'http://localhost:8080').trim().replace(/\/$/, '');
  return url.includes('://') ? url : `https://${url}`;
}

const BASE_URL = apiBase(import.meta.env.VITE_API_URL);
export const TOKEN_KEY = 'gnt_token';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

/* ── Request interceptor: attach JWT if present ── */
apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Response interceptor: an expired session signs the user out ── */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && readToken()) {
      clearToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

/** Store a JWT in the appropriate storage based on "remember me". */
export function storeToken(token: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Remove the JWT from both storages. */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}
