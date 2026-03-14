'use client';

import { useRef, useEffect } from 'react';

const VISA_PLACEHOLDER: Record<string, string> = {
  'E-7': '예: 응웬반아 E-7 변경',
  'E-9': '예: 라흐만 사업장 변경',
  'D-10': '예: 왕레이 구직비자 변경',
  'D-4': '예: 천밍 어학연수 연장',
  'F-5': '예: 팜티비 영주권 신청',
  'F-6': '예: 마리아 결혼비자 신규',
  'F-2': '예: 리웨이 거주비자 변경',
  'F-2-R': '예: 트란반 지역특화 F-2-R',
  'F-2-7': '예: 쿠마르 점수제 F-2-7',
  'H-2': '예: 볼드바트 방문취업 연장',
  'C-3': '예: 다나카 단기방문',
  'D-2': '예: 존스미스 유학비자 연장',
};

function getPlaceholder(visaType?: string): string {
  if (!visaType) return '예: 응웬반아 E-7 변경';
  if (VISA_PLACEHOLDER[visaType]) return VISA_PLACEHOLDER[visaType];
  // F-2-1 등 세부유형 → F-2 fallback
  const base = visaType.split('-').slice(0, 2).join('-');
  return VISA_PLACEHOLDER[base] || '예: 홍길동 비자 변경';
}

interface StepForeignerNameProps {
  value: string;
  onChange: (name: string) => void;
  showSubmit: boolean;
  onSubmit: () => void;
  visaType?: string;
}

export default function StepForeignerName({ value, onChange, showSubmit, onSubmit, visaType }: StepForeignerNameProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit();
    }
  };

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      <h1 className="text-2xl font-bold text-black/90">
        업무 이름을 입력해 주세요
      </h1>

      <div className="mt-8">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder(visaType)}
          className="w-full rounded-2xl border border-black/[0.08] bg-white px-6 py-4 text-xl font-medium text-black/85 outline-none placeholder:text-black/25 transition-all duration-200 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(36,99,235,0.08)]"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="mt-8 w-full rounded-2xl bg-primary py-4 text-[17px] font-semibold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {showSubmit ? '업무 생성하기' : '다음'}
      </button>
    </div>
  );
}
