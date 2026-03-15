import { create } from "zustand";
import { api } from "@/lib/api";
import { caseApi } from "@/lib/case-api";
import { getSessionToken, clearSessionToken } from "@/lib/session-token";

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthResponse {
  user: User;
}

interface AuthState {
  user: User | null;
  isReady: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; passwordConfirm: string }) => Promise<void>;
  logout: () => Promise<void>;
}

async function claimGuestCases() {
  const token = getSessionToken();
  if (!token) return;
  try {
    await caseApi.claim(token);
  } catch {
    // Claim is best-effort
  }
  clearSessionToken();
}

let fetchPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isReady: false,

  fetchUser: async () => {
    if (fetchPromise) return fetchPromise;
    fetchPromise = (async () => {
      try {
        const user = await api<User>("/api/auth/me");
        set({ user, isReady: true });
      } catch {
        set({ user: null, isReady: true });
      } finally {
        fetchPromise = null;
      }
    })();
    return fetchPromise;
  },

  login: async (email, password) => {
    const { user } = await api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    set({ user, isReady: true });
    await claimGuestCases();
  },

  signup: async (data) => {
    const { user } = await api<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    set({ user, isReady: true });
    await claimGuestCases();
  },

  logout: async () => {
    await api("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));
