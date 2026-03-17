'use client';

import type { FieldGroup, AnyField } from './constants';
import { getDefaultValue, MAPPING_INPUT_CLASS } from './constants';

interface FieldGroupSectionProps {
  group: FieldGroup;
  fields: AnyField[];
  getFieldValue: (pdfField: string, fallback?: string) => string;
  onFieldChange: (pdfField: string, val: string) => void;
  onFieldBlur: (pdfField: string, val: string) => void;
}

export default function FieldGroupSection({
  group,
  fields,
  getFieldValue,
  onFieldChange,
  onFieldBlur,
}: FieldGroupSectionProps) {
  const allFilled = fields.every(
    (f) => getFieldValue(f.pdfField, getDefaultValue(f)) !== '',
  );

  return (
    <div className={`rounded-md px-3 py-2.5 ${allFilled ? 'bg-emerald-50/50' : 'bg-black/[0.02]'}`}>
      <p className="mb-2 text-xs font-semibold text-black/50">{group.label}</p>
      <div
        className="gap-2"
        style={{
          display: 'grid',
          gridTemplateColumns: group.cols ?? '1fr',
        }}
      >
        {fields.map((f) => {
          const val = getFieldValue(f.pdfField, getDefaultValue(f));
          const filled = val !== '';
          return (
            <div key={f.pdfField}>
              <div className="mb-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[11px] font-medium text-black/50">{f.label}</span>
                <span className="text-[9px] text-black/20">{f.pdfField}</span>
              </div>
              <input
                type="text"
                placeholder={f.label}
                value={val}
                onChange={(e) => onFieldChange(f.pdfField, e.target.value)}
                onBlur={(e) => onFieldBlur(f.pdfField, e.target.value)}
                className={`${MAPPING_INPUT_CLASS} ${filled ? 'border-emerald-200' : 'border-black/10'}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
