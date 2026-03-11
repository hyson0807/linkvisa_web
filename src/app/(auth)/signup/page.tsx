import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "회원가입 | 링크비자 (LinkVisa)",
  description:
    "링크비자에 가입하여 비자 서류 자동화 서비스를 이용하세요.",
};

export default function SignupPage() {
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
            회원가입
          </h1>
          <p className="mb-8 text-sm text-text-muted">
            링크비자와 함께 비자 서류를 간편하게 관리하세요
          </p>

          {/* 폼 (UI only) */}
          <form className="space-y-5">
            {/* 이름 */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                이름
              </label>
              <input
                id="name"
                type="text"
                placeholder="홍길동"
                autoComplete="name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

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
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="password-confirm"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                비밀번호 확인
              </label>
              <input
                id="password-confirm"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="cta-btn w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover"
            >
              회원가입
            </button>
          </form>

          {/* 로그인 링크 */}
          <p className="mt-6 text-center text-sm text-text-muted">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary-hover transition-colors"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
