"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function useRequireAuth() {
  const router = useRouter();
  const { user, isReady, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isReady) {
      fetchUser();
    } else if (!user) {
      router.replace("/login");
    }
  }, [isReady, user, fetchUser, router]);

  return { user, isLoading: !isReady };
}
