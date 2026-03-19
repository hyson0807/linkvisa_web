import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-black/[0.02] py-24 md:py-32">
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <h2 className="mb-8 text-3xl font-bold leading-snug text-black md:text-4xl">
          서류 걱정 없는 첫 케이스,<br />
          지금 시작하세요
        </h2>
        <Link
          href="/cases/new"
          className="cta-btn inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-semibold text-white"
        >
          무료로 시작하기
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-black/35">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-black/20" />
            설치 없음
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-black/20" />
            회원가입 없음
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-black/20" />
            바로 시작
          </span>
        </div>
      </div>
    </section>
  );
}
