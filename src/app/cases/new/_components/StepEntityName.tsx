'use client';

import { useRef, useEffect } from 'react';

interface StepEntityNameProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (name: string) => void;
  onSubmit: () => void;
}

export default function StepEntityName({ label, placeholder, value, onChange, onSubmit }: StepEntityNameProps) {
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
        {label}
      </h1>

      <div className="mt-8">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-black/[0.08] bg-white px-6 py-4 text-xl font-medium text-black/85 outline-none placeholder:text-black/25 transition-all duration-200 focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(36,99,235,0.08)]"
        />
      </div>

      <button
        onClick={onSubmit}
        disabled={!value.trim()}
        className="mt-8 w-full rounded-2xl bg-primary py-4 text-[17px] font-semibold text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
      >
        케이스 생성
      </button>
    </div>
  );
}
