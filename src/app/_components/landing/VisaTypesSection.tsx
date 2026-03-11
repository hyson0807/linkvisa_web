'use client';

import { useInViewAnimation } from './useInViewAnimation';

const visaCodes = ['E-7', 'E-9', 'D-2', 'D-10', 'F-2', 'F-6', 'H-2'];

export default function VisaTypesSection() {
  const { ref, visible } = useInViewAnimation(0.3);

  return (
    <section ref={ref} className="mx-auto max-w-4xl px-6 py-24 md:py-32">
      <h2 className="mb-4 text-center text-3xl font-bold text-black md:text-4xl">
        주요 비자 유형, 모두 지원합니다
      </h2>
      <p className="mx-auto mb-12 max-w-md text-center text-base text-black/50">
        비자별 필수 서류가 자동으로 구성됩니다
      </p>

      <div
        className={`flex flex-wrap items-center justify-center gap-3 transition-all duration-700 md:gap-4 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {visaCodes.map((visa, idx) => (
          <span
            key={visa}
            className={`rounded-xl border border-primary/10 bg-white px-7 py-3.5 text-lg font-bold text-primary shadow-sm transition-all duration-500 hover:border-primary/25 hover:shadow-md hover:-translate-y-1 cursor-default ${
              visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ transitionDelay: visible ? `${idx * 80}ms` : '0ms' }}
          >
            {visa}
          </span>
        ))}
      </div>

      <div className={`mt-8 text-center transition-all duration-700 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-sm text-black/30">+ 더 많은 비자 유형 지원 예정</span>
      </div>
    </section>
  );
}
