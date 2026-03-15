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

  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.message ??
      (Array.isArray(body.errors) ? body.errors.join(", ") : res.statusText);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
