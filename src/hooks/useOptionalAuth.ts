"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function useOptionalAuth() {
  const { user, isReady, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isReady) {
      fetchUser();
    }
  }, [isReady, fetchUser]);

  return { user, isReady };
}
