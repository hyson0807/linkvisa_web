'use client';

import React, { useRef } from 'react';

interface AlienRegRowProps {
  digits: string[];
  onDigitChange: (idx: number, val: string) => void;
  onDigitBlur: (idx: number, val: string) => void;
}

export default function AlienRegRow({
  digits,
  onDigitChange,
  onDigitBlur,
}: AlienRegRowProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const filled = digits.some((d) => d !== '');

  return (
    <div className={`rounded-md px-3 py-2.5 ${filled ? 'bg-emerald-50/50' : 'bg-black/[0.02]'}`}>
      <p className="mb-2 text-xs font-semibold text-black/50">외국인등록번호</p>
      <div className="flex items-center gap-0.5">
        {digits.map((digit, i) => (
          <React.Fragment key={i}>
            {i === 6 && (
              <span className="mx-1 text-sm font-bold text-black/30">-</span>
            )}
            <input
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                onDigitChange(i, val);
                if (val && i < 12) {
                  inputRefs.current[i + 1]?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                  inputRefs.current[i - 1]?.focus();
                }
              }}
              onBlur={(e) => onDigitBlur(i, e.target.value)}
              className={`h-8 w-6 rounded border text-center text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                filled ? 'border-emerald-200 bg-white' : 'border-black/10 bg-white'
              }`}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
