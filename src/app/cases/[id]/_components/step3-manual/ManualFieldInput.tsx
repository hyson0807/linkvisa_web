'use client';

import type { ManualFieldDef } from '@/types/case';

interface ManualFieldInputProps {
  field: ManualFieldDef;
  value: string;
  onChange: (value: string) => void;
}

export default function ManualFieldInput({ field, value, onChange }: ManualFieldInputProps) {
  const baseClass =
    'w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-base text-black/80 placeholder:text-black/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

  switch (field.fieldType) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      );

    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          <option value="">선택해 주세요</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="flex items-center gap-5 pt-1">
          {field.options?.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 text-base text-black/70"
            >
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="h-4 w-4 accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      );

    default:
      return null;
  }
}
