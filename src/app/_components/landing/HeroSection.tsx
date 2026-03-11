import Link from "next/link";
import HeroDemo from "./HeroDemo";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* 배경 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-light/15 via-white to-blue-50/30" />
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/[0.04]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/[0.03]" />

      <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
        <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
          {/* Left */}
          <div className="text-center md:pl-16 md:text-left">
            <h1 className="text-[32px] font-extrabold leading-[1.3] tracking-tight text-black md:text-[42px]">
              반복되는 비자 서류 업무,<br />
              <span className="text-primary">링크비자</span>가 처리할게요!
            </h1>

            <p className="mx-auto mt-5 max-w-md text-[17px] leading-[1.7] font-medium text-black/45 md:mx-0 md:text-[19px]">
              출입국 인증대행 행정사들을 위한<br className="hidden md:block" />
              단 하나의 업무도구
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:items-start">
              <Link
                href="/cases/new"
                className="cta-btn inline-flex items-center justify-center rounded-2xl bg-primary px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/20"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
