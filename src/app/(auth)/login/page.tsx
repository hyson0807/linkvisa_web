"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* 헤더 */}
          <h1 className="font-display mb-2 text-2xl font-bold text-text-primary">
            로그인
          </h1>
          <p className="mb-8 text-sm text-text-muted">
            비자 서류 자동화 플랫폼에 오신 것을 환영합니다
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 폼 */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-text-secondary"
                >
                  비밀번호
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-btn w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <p className="mt-6 text-center text-sm text-text-muted">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
