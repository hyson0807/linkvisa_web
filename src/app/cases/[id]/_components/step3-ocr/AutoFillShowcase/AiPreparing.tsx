'use client';

import { useState, useEffect } from 'react';

const STEPS = ['데이터 분석 중', 'AI 모델 적용 중', '문서 생성 준비 중'];

export default function AiPreparing() {
  const [dots, setDots] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const stepInterval = setInterval(() => {
      setStep(prev => (prev + 1) % 3);
    }, 800);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[260px]">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 blur-2xl opacity-40 animate-pulse" />
        <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <svg className="h-10 w-10 text-white ai-sparkle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-bold text-black/80 mb-2">
          AI가 문서를 작성합니다{dots}
        </div>
        <div className="text-sm text-black/40 mb-6">{STEPS[step]}</div>
      </div>

      <div className="flex items-center gap-2">
        {[0, 1, 2].map(idx => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              idx === step ? 'bg-purple-500 scale-125' : 'bg-black/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
