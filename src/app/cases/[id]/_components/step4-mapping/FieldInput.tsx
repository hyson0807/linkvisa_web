'use client';

import type { AnyField } from './constants';

interface FieldInputProps {
  field: AnyField;
  value: string;
  onChange: (val: string) => void;
  onBlur: (val: string) => void;
}

export default function FieldInput({
  field,
  value,
  onChange,
  onBlur,
}: FieldInputProps) {
  const filled = value !== '';
  return (
    <div className={`rounded-md px-3 py-2 ${filled ? 'bg-emerald-50/50' : 'bg-amber-50/50'}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-black/60">{field.label}</span>
        <span className="text-[10px] text-black/30">{field.pdfField}</span>
      </div>
      <input
        type="text"
        placeholder={`${field.label} 입력`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value)}
        className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 placeholder:text-black/25 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
          filled ? 'border-emerald-200' : 'border-amber-200'
        }`}
      />
    </div>
  );
}
