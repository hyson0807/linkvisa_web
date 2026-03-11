'use client';

import { useCaseStore } from '@/store/case-store';
import {
  getFieldsForVisa,
  sectionMeta,
  sectionOrder,
} from '@/lib/manual-field-registry';
import ManualFieldSection from './ManualFieldSection';
import type { Case, ManualFieldDef } from '@/types/case';

interface ManualInputStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

export default function ManualInputStep({ caseData, onNext, onPrev }: ManualInputStepProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  const fields = getFieldsForVisa(caseData.visaType);
  const values = caseData.manualFields ?? {};

  const sectionFields: Record<string, ManualFieldDef[]> = {};
  for (const f of fields) {
    if (!sectionFields[f.section]) sectionFields[f.section] = [];
    sectionFields[f.section].push(f);
  }

  const visibleSections = sectionOrder.filter((sec) => {
    const meta = sectionMeta[sec];
    if (meta.visaFilter && !meta.visaFilter.includes(caseData.visaType)) return false;
    return sectionFields[sec] && sectionFields[sec].length > 0;
  });

  const requiredFields = fields.filter((f) => f.required);
  const filledRequired = requiredFields.filter((f) => values[f.id]?.trim()).length;
  const totalFilled = fields.filter((f) => values[f.id]?.trim()).length;
  const canProceed = filledRequired === requiredFields.length;

  const handleChange = (fieldId: string, value: string) => {
    setManualField(caseData.id, fieldId, value);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black/90">
          이 정보만 입력하면 끝
        </h2>
        <p className="mt-1.5 text-sm text-black/40">
          업로드한 서류 외에 아래 정보만 입력하면, 공문서 양식에 맞게 완성됩니다
        </p>
      </div>

      <div className="mb-8 rounded-xl bg-white border border-black/5 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-base font-semibold text-black/70">
              입력 현황
            </span>
          </div>
          <span className="text-base font-bold text-primary">
            {totalFilled}/{fields.length} 입력 완료
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-black/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              canProceed ? 'bg-green-500' : 'bg-primary'
            }`}
            style={{ width: `${fields.length > 0 ? Math.round((totalFilled / fields.length) * 100) : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {visibleSections.map((sec) => {
          const meta = sectionMeta[sec];
          return (
            <ManualFieldSection
              key={sec}
              label={meta.label}
              fields={sectionFields[sec]}
              values={values}
              defaultOpen={meta.defaultOpen}
              badge={sec === 'other' ? '기본값 자동 설정됨' : sec === 'employment_reason' ? '서술 항목은 AI가 자동 작성' : undefined}
              onChange={handleChange}
            />
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onPrev}
          className="rounded-xl border border-black/10 px-6 py-3 text-base font-medium text-black/50 hover:bg-black/3"
        >
          ← 서류 업로드 수정
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`rounded-xl px-8 py-3 text-base font-semibold transition-all ${
            canProceed
              ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark'
              : 'bg-black/5 text-black/30 cursor-not-allowed'
          }`}
        >
          다음: 공문서 완성 →
        </button>
      </div>
    </div>
  );
}
