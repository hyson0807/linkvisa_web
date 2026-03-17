'use client';

import type { Case } from '@/types/case';
import { ocrFallback } from '@/lib/pdf/field-utils';
import type { FieldGroup, AnyField } from './constants';
import { SEX_OPTIONS, getDefaultValue, MAPPING_INPUT_CLASS } from './constants';

interface BirthSexSectionProps {
  group: FieldGroup;
  fields: AnyField[];
  caseData: Case;
  getFieldValue: (pdfField: string, fallback?: string) => string;
  onFieldChange: (pdfField: string, val: string) => void;
  onFieldBlur: (pdfField: string, val: string) => void;
  onManualField: (fieldId: string, val: string) => void;
}

export default function BirthSexSection({
  group,
  fields,
  caseData,
  getFieldValue,
  onFieldChange,
  onFieldBlur,
  onManualField,
}: BirthSexSectionProps) {
  // Resolve current sex: manual override → OCR
  const ocrSex = ocrFallback(caseData, ['passport', '성별'], ['alien_registration', '성별']).toUpperCase();
  const normalizedOcrSex = (ocrSex === 'M' || ocrSex === '남') ? '남' : (ocrSex === 'F' || ocrSex === '여') ? '여' : '';
  const sex = caseData.manualFields?.sex || normalizedOcrSex;

  return (
    <div className="rounded-md bg-black/[0.02] px-3 py-2.5">
      <p className="mb-2 text-xs font-semibold text-black/50">{group.label}</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
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
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-black/50">성별</span>
          <select
            value={sex}
            onChange={(e) => onManualField('sex', e.target.value)}
            className={`${MAPPING_INPUT_CLASS} ${sex ? 'border-emerald-200' : 'border-black/10'}`}
          >
            {SEX_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
