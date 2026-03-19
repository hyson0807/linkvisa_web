"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOptionalAuth } from "./useOptionalAuth";

export function useRequireAuth() {
  const router = useRouter();
  const { user, isReady } = useOptionalAuth();

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/login");
    }
  }, [isReady, user, router]);

  return { user, isLoading: !isReady };
}
