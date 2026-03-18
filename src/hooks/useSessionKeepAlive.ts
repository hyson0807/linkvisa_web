"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { onSessionRefresh, refreshAccessToken } from "@/lib/api";

const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const PROACTIVE_REFRESH_MS = 60 * 1000;

export function useSessionKeepAlive() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    function scheduleRefresh(remainingMs: number) {
      if (timerRef.current) clearTimeout(timerRef.current);

      const delay = remainingMs - PROACTIVE_REFRESH_MS;
      if (delay <= 0) {
        doRefresh();
        return;
      }

      timerRef.current = setTimeout(doRefresh, delay);
    }

    async function doRefresh() {
      const ok = await refreshAccessToken();
      if (!ok) {
        await logout();
      }
    }

    scheduleRefresh(ACCESS_TOKEN_LIFETIME_MS);

    const unsubscribe = onSessionRefresh((remainingMs: number) => {
      scheduleRefresh(remainingMs);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      unsubscribe();
    };
  }, [user, logout]);
}
