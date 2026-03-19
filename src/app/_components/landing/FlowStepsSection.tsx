'use client';

import { useInViewAnimation } from './useInViewAnimation';

const steps = [
  {
    number: '1',
    title: '파일 올리기',
    desc: '여권·서류 사진을 올리세요',
    icon: (
      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    number: '2',
    title: '자동으로 채워짐',
    desc: '신청서가 알아서 완성됩니다',
    icon: (
      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    number: '3',
    title: '인쇄만 하면 끝',
    desc: '출력 버튼 한 번이면 끝',
    icon: (
      <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 7.034V3.375" />
      </svg>
    ),
  },
];

export default function FlowStepsSection() {
  const { ref, visible } = useInViewAnimation();

  return (
    <section ref={ref} className="mx-auto max-w-5xl px-6 py-24 md:py-32">
      <h2 className="mb-4 text-center text-3xl font-bold text-black md:text-4xl">
        이게 전부입니다
      </h2>
      <p className="mx-auto mb-16 max-w-md text-center text-base text-black/50">
        복잡한 설정이나 학습 없이, 세 단계면 됩니다
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`card-hover flex-1 rounded-2xl border border-black/[0.06] bg-white p-8 text-center shadow-sm transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: visible ? `${idx * 150}ms` : '0ms' }}
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-primary-light/30">
                {step.icon}
              </div>
              <div className="mb-2 inline-flex items-center rounded-full bg-primary/[0.06] px-3 py-0.5 text-xs font-bold text-primary">
                Step {step.number}
              </div>
              <h3 className="mb-2 text-xl font-bold text-black">{step.title}</h3>
              <p className="text-base text-black/50">{step.desc}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className="hidden shrink-0 px-2 text-black/15 md:block">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
