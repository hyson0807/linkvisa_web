import Link from "next/link";

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-bold text-primary">LinkVisa</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-black/60 transition-colors hover:text-black"
          >
            로그인
          </Link>
          <Link
            href="/cases/new"
            className="cta-btn rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            무료로 시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
