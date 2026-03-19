"use client";

import Link from "next/link";
import { useOptionalAuth } from "@/hooks/useOptionalAuth";
import { useSessionKeepAlive } from "@/hooks/useSessionKeepAlive";

export default function CasesAppHeader() {
  useOptionalAuth();
  useSessionKeepAlive();

  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            LinkVisa
          </Link>
        </div>
      </div>
    </header>
  );
}
