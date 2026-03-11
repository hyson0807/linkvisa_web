'use client';

import { useRef, useEffect } from 'react';

interface StepForeignerNameProps {
  value: string;
  onChange: (name: string) => void;
  showSubmit: boolean;
  onSubmit: () => void;
}

export default function StepForeignerName({ value, onChange, showSubmit, onSubmit }: StepForeignerNameProps) {
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
        외국인의 이름을 입력해 주세요
      </h1>
      <p className="mt-2 text-base leading-relaxed text-black/45">
        여권에 기재된 영문 이름을 입력합니다
      </p>

      <div className="mt-8">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: NGUYEN VAN A"
          className="w-full rounded-2xl border border-black/[0.08] bg-white px-6 py-4 text-xl font-medium text-black/85 outline-none placeholder:text-black/25 transition-all duration-200 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(36,99,235,0.08)]"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="mt-8 w-full rounded-2xl bg-primary py-4 text-[17px] font-semibold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {showSubmit ? '케이스 생성' : '다음'}
      </button>
    </div>
  );
}
