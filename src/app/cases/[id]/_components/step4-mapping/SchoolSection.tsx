'use client';

import type { Case } from '@/types/case';
import type { FieldGroup, AnyField } from './constants';
import { SCHOOL_STATUS_OPTIONS, SCHOOL_TYPE_OPTIONS, getDefaultValue, MAPPING_INPUT_CLASS } from './constants';

interface SchoolSectionProps {
  group: FieldGroup;
  fields: AnyField[];
  caseData: Case;
  getFieldValue: (pdfField: string, fallback?: string) => string;
  onFieldChange: (pdfField: string, val: string) => void;
  onFieldBlur: (pdfField: string, val: string) => void;
  onManualField: (fieldId: string, val: string) => void;
}

export default function SchoolSection({
  group,
  fields,
  caseData,
  getFieldValue,
  onFieldChange,
  onFieldBlur,
  onManualField,
}: SchoolSectionProps) {
  const schoolStatus = caseData.manualFields?.school_status ?? '';
  const schoolType = caseData.manualFields?.school_type ?? '';

  return (
    <div className="rounded-md bg-black/[0.02] px-3 py-2.5">
      <p className="mb-2 text-xs font-semibold text-black/50">{group.label}</p>

      {/* Selects row */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-black/50">재학 여부</span>
          <select
            value={schoolStatus}
            onChange={(e) => onManualField('school_status', e.target.value)}
            className={`${MAPPING_INPUT_CLASS} ${schoolStatus ? 'border-emerald-200' : 'border-black/10'}`}
          >
            {SCHOOL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-black/50">학교 종류</span>
          <select
            value={schoolType}
            onChange={(e) => onManualField('school_type', e.target.value)}
            className={`${MAPPING_INPUT_CLASS} ${schoolType ? 'border-emerald-200' : 'border-black/10'}`}
          >
            {SCHOOL_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Text fields */}
      <div
        className="gap-2"
        style={{ display: 'grid', gridTemplateColumns: group.cols ?? '1fr' }}
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
