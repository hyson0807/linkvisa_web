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
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && { "Content-Type": "application/json" }),
      "X-Requested-With": "XMLHttpRequest",
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
