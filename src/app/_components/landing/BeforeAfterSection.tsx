'use client';

import { useInViewAnimation } from './useInViewAnimation';

const comparisons = [
  { before: '수기로 20장 작성', after: '파일 올리면 자동 완성' },
  { before: '오타·누락 걱정', after: '정확하게 한 번에' },
  { before: '서류 하나에 30분', after: '전체 서류 10분' },
];

export default function BeforeAfterSection() {
  const { ref, visible } = useInViewAnimation();

  return (
    <section ref={ref} className="relative overflow-hidden bg-black/[0.02] py-24 md:py-32">
      <div className="dot-pattern pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-4xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold text-black md:text-4xl">
          기존 방식 vs 링크비자
        </h2>
        <p className="mx-auto mb-16 max-w-md text-center text-base text-black/50">
          비교하면 답이 보입니다
        </p>

        <div
          className={`grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Before */}
          <div className="rounded-2xl border border-black/[0.06] bg-white/60 p-8 backdrop-blur-sm">
            <div className="mb-6 text-center">
              <span className="inline-block rounded-full border border-black/[0.06] bg-black/[0.03] px-4 py-1.5 text-sm font-semibold text-black/40">
                기존 방식
              </span>
            </div>
            <div className="space-y-3">
              {comparisons.map((item) => (
                <div
                  key={item.before}
                  className="flex items-center gap-3 rounded-xl border border-black/[0.04] bg-white px-5 py-4 transition-colors hover:bg-black/[0.01]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-xs text-red-400">
                    ✕
                  </span>
                  <span className="text-base text-black/40 line-through decoration-black/10">{item.before}</span>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-primary/15 bg-white p-8 shadow-[0_4px_24px_rgba(36,99,235,0.06)]">
            <div className="mb-6 text-center">
              <span className="inline-block rounded-full border border-primary/15 bg-primary-light/30 px-4 py-1.5 text-sm font-semibold text-primary">
                링크비자
              </span>
            </div>
            <div className="space-y-3">
              {comparisons.map((item) => (
                <div
                  key={item.after}
                  className="flex items-center gap-3 rounded-xl border border-primary/[0.06] bg-primary-light/10 px-5 py-4 transition-colors hover:bg-primary-light/20"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-xs text-green-500">
                    ✓
                  </span>
                  <span className="text-base font-medium text-black/80">{item.after}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
