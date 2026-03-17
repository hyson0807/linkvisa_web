import { getSessionToken } from './session-token';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/* ── 세션 타이머 연동 ── */
type SessionListener = (remainingMs: number) => void;
const sessionListeners = new Set<SessionListener>();

/** AppHeader 등에서 세션 갱신 이벤트를 구독 */
export function onSessionRefresh(listener: SessionListener) {
  sessionListeners.add(listener);
  return () => { sessionListeners.delete(listener); };
}

function notifySessionRefresh(remainingMs: number) {
  sessionListeners.forEach((fn) => fn(remainingMs));
}

/* ── 토큰 갱신 ── */
const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15분
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  // 동시 다발적 401에 대해 refresh 요청을 한 번만 보냄
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) {
        notifySessionRefresh(ACCESS_TOKEN_LIFETIME_MS);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ── API 호출 ── */
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    "X-Requested-With": "XMLHttpRequest",
  };

  // Only send session token when it already exists (don't create one for authenticated users)
  if (typeof window !== 'undefined' && localStorage.getItem('linkvisa-session-token')) {
    headers["X-Session-Token"] = getSessionToken();
  }

  const mergedOptions: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  let res = await fetch(path, mergedOptions);

  // 401이면 토큰 갱신 후 한 번 재시도 (refresh 엔드포인트 자체는 제외)
  if (res.status === 401 && path !== '/api/auth/refresh' && path !== '/api/auth/login') {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(path, mergedOptions);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.message ??
      (Array.isArray(body.errors) ? body.errors.join(", ") : res.statusText);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}
