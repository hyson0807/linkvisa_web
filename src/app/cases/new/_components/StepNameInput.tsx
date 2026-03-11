'use client';

import { useRef, useEffect } from 'react';

interface StepNameInputProps {
  title: string;
  subtitle?: string;
  placeholder: string;
  submitLabel: string;
  value: string;
  onChange: (name: string) => void;
  onSubmit: () => void;
}

export default function StepNameInput({ title, subtitle, placeholder, submitLabel, value, onChange, onSubmit }: StepNameInputProps) {
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
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base leading-relaxed text-black/45">
          {subtitle}
        </p>
      )}

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
        {submitLabel}
      </button>
    </div>
  );
}
