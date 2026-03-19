const SESSION_TOKEN_KEY = 'linkvisa-session-token';

export function getSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}

export function clearSessionToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
}
