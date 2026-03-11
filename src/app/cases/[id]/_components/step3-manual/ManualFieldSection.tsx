'use client';

import { useState } from 'react';
import type { ManualFieldDef } from '@/types/case';
import ManualFieldInput from './ManualFieldInput';

interface ManualFieldSectionProps {
  label: string;
  fields: ManualFieldDef[];
  values: Record<string, string>;
  defaultOpen: boolean;
  badge?: string;
  onChange: (fieldId: string, value: string) => void;
}

export default function ManualFieldSection({
  label,
  fields,
  values,
  defaultOpen,
  badge,
  onChange,
}: ManualFieldSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const filledCount = fields.filter((f) => values[f.id]?.trim()).length;
  const allFilled = filledCount === fields.length;

  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-black/[0.01] transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <svg
            className={`h-4 w-4 shrink-0 text-black/30 transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-black/80">{label}</span>
            <span className="text-sm text-black/35">
              {filledCount}/{fields.length}
            </span>
            {allFilled && (
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-600">
                완료
              </span>
            )}
            {badge && !allFilled && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {badge}
              </span>
            )}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-black/5 px-6 py-5">
          <div className="grid grid-cols-2 gap-x-5 gap-y-5">
            {fields.map((field) => (
              <div key={field.id} className={field.halfWidth ? 'col-span-1' : 'col-span-2'}>
                <label className="mb-2 block text-sm font-semibold text-black/60">
                  {field.label}
                  {field.required && <span className="ml-0.5 text-red-400">*</span>}
                </label>
                <ManualFieldInput
                  field={field}
                  value={values[field.id] ?? ''}
                  onChange={(v) => onChange(field.id, v)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
