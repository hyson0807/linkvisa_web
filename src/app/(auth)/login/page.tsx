"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* 배경 데코레이션 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light/15 via-white to-blue-50/30" />
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/[0.04]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/[0.03]" />

      {/* 홈 링크 + 카드 컨테이너 */}
      <div className="relative flex w-full max-w-md flex-col items-start gap-4">
        <Link
          href="/"
          className="text-xl font-bold text-primary transition-opacity hover:opacity-80"
        >
          ← LinkVisa
        </Link>

        {/* 카드 */}
        <div
          className="w-full rounded-2xl border border-black/[0.06] bg-white p-8 shadow-sm sm:p-10"
          style={{ animation: "fadeInUp 0.6s ease-out" }}
        >
          <LoginForm onSuccess={() => router.push("/dashboard")} />
        </div>
      </div>
    </main>
  );
}
