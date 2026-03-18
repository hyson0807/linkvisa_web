'use client';

import { useState } from 'react';
import type { Case } from '@/types/case';
import { generateEmploymentReason, type GenerateReasonResult } from '@/lib/ai-generate-api';
import type { FieldGroup, AnyField } from './constants';
import { getDefaultValue, MAPPING_INPUT_CLASS } from './constants';

interface AiReasonSectionProps {
  group: FieldGroup;
  fields: AnyField[];
  caseData: Case;
  getFieldValue: (pdfField: string, fallback?: string) => string;
  onFieldChange: (pdfField: string, val: string) => void;
  onFieldBlur: (pdfField: string, val: string) => void;
  onApply: (fields: Record<string, string>) => void;
}

const FIELD_KEYS: { key: keyof GenerateReasonResult; pdfField: string; label: string }[] = [
  { key: 'er_reason', pdfField: 't37', label: '고용사유' },
  { key: 'er_tech_effect', pdfField: 't38', label: '기술도입 및 고용효과' },
  { key: 'er_utilization_plan', pdfField: 't39', label: '활용계획' },
  { key: 'er_other', pdfField: 't40', label: '기타사항' },
];

export default function AiReasonSection({
  group,
  fields,
  caseData,
  getFieldValue,
  onFieldChange,
  onFieldBlur,
  onApply,
}: AiReasonSectionProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [preview, setPreview] = useState<GenerateReasonResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const allFilled = fields.every(
    (f) => getFieldValue(f.pdfField, getDefaultValue(f)) !== '',
  );

  const hasSpecialistInfo = Boolean(
    caseData.manualFields?.specialist_major ||
    caseData.manualFields?.specialist_role ||
    caseData.manualFields?.specialist_duty
  );

  const handleGenerate = async () => {
    if (!hasSpecialistInfo) {
      setErrorMsg('전문인력 정보(전공/자격 직종, 담당 업무, 세부 직무 내용)를 먼저 입력해주세요.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setPreview(null);
    setErrorMsg('');

    try {
      const result = await generateEmploymentReason(caseData.id);
      setPreview(result);
      setStatus('idle');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'AI 생성에 실패했습니다.');
      setStatus('error');
    }
  };

  const handleApply = () => {
    if (!preview) return;
    const updates: Record<string, string> = {};
    for (const { key, pdfField } of FIELD_KEYS) {
      if (preview[key]) updates[pdfField] = preview[key];
    }
    onApply(updates);
    setPreview(null);
  };

  return (
    <div className={`rounded-md px-3 py-2.5 ${allFilled ? 'bg-emerald-50/50' : 'bg-black/[0.02]'}`}>
      <p className="mb-2 text-xs font-semibold text-black/50">{group.label}</p>

      {/* AI Generate Button */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {status === 'loading' ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI가 작성 중입니다...
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
              </svg>
              {preview ? '다시 생성' : 'AI 자동 작성'}
            </>
          )}
        </button>
        {status !== 'loading' && !preview && (
          <span className="text-[10px] text-black/30">전문인력 정보를 바탕으로 AI가 작성합니다</span>
        )}
      </div>

      {/* Error */}
      {status === 'error' && errorMsg && (
        <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          {errorMsg}
          <button
            type="button"
            onClick={handleGenerate}
            className="ml-2 font-medium underline hover:text-red-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mb-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3">
          <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-amber-600">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            AI 생성 내용입니다. 검토 후 수정하세요.
          </p>
          <div className="space-y-2">
            {FIELD_KEYS.map(({ key, label }) => (
              <div key={key}>
                <p className="text-[10px] font-medium text-black/40 mb-0.5">{label}</p>
                <p className="text-xs text-black/70 whitespace-pre-wrap leading-relaxed">{preview[key] || '(내용 없음)'}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors"
            >
              적용하기
            </button>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-black/40 hover:text-black/60 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Field inputs (textarea for long text) */}
      <div className="space-y-2">
        {fields.map((f) => {
          const val = getFieldValue(f.pdfField, getDefaultValue(f));
          const filled = val !== '';
          return (
            <div key={f.pdfField}>
              <div className="mb-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[11px] font-medium text-black/50">{f.label}</span>
                <span className="text-[9px] text-black/20">{f.pdfField}</span>
              </div>
              <textarea
                placeholder={f.label}
                value={val}
                onChange={(e) => onFieldChange(f.pdfField, e.target.value)}
                onBlur={(e) => onFieldBlur(f.pdfField, e.target.value)}
                rows={3}
                className={`${MAPPING_INPUT_CLASS} resize-y ${filled ? 'border-emerald-200' : 'border-black/10'}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
