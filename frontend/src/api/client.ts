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

/* ── Slow-request signal ──
   On the free hosting plan the API sleeps when nobody uses it, and the first request waits while
   it starts again. A request still running after SLOW_MS raises `api:slow` so the app can explain
   the wait instead of looking frozen; `api:settled` fires once no slow request is left. */
const SLOW_MS = 3000;
let slowCount = 0;
const pending = new WeakMap<object, { timer: number; slow: boolean }>();

function track(config: object) {
  const entry = { timer: 0, slow: false };
  entry.timer = window.setTimeout(() => {
    entry.slow = true;
    slowCount += 1;
    if (slowCount === 1) window.dispatchEvent(new Event('api:slow'));
  }, SLOW_MS);
  pending.set(config, entry);
}

function untrack(config: object | undefined) {
  const entry = config && pending.get(config);
  if (!entry) return;
  window.clearTimeout(entry.timer);
  pending.delete(config!);
  if (entry.slow) {
    slowCount -= 1;
    if (slowCount === 0) window.dispatchEvent(new Event('api:settled'));
  }
}

/** Wakes the API early (e.g. while someone is still typing) so their first real request is quick. */
export function warmUp() {
  apiClient.get('/api/products', { params: { size: 1 } }).catch(() => undefined);
}

/* ── Request interceptor: attach JWT if present ── */
apiClient.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  track(config);
  return config;
});

/* ── Response interceptor: an expired session signs the user out ── */
apiClient.interceptors.response.use(
  (response) => {
    untrack(response.config);
    return response;
  },
  (error) => {
    untrack(error.config);
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
