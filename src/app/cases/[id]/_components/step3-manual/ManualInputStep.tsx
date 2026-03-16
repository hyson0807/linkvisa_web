'use client';

import { useMemo, useState } from 'react';
import { useCaseStore } from '@/store/case-store';
import {
  getFieldsForVisa,
  sectionMeta,
  sectionOrder,
} from '@/lib/manual-field-registry';
import { resolveDocsWithType } from '@/lib/document-registry';
import ManualFieldSection from './ManualFieldSection';
import type { Case, ManualFieldDef } from '@/types/case';

interface ManualInputStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

function OcrDebugPanel({ caseData }: { caseData: Case }) {
  const [open, setOpen] = useState(true);
  const ocrDocs = useMemo(
    () => resolveDocsWithType(caseData).filter(
      (d) => d.caseDoc.ocrResult && Object.keys(d.caseDoc.ocrResult).length > 0,
    ),
    [caseData],
  );

  if (ocrDocs.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-amber-700">
          OCR 추출 결과 (테스트용)
        </span>
        <span className="text-xs text-amber-500">{open ? '접기 ▲' : '펼치기 ▼'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {ocrDocs.map((d) => (
            <div key={d.caseDoc.id} className="rounded-lg bg-white/70 p-3">
              <p className="mb-2 text-xs font-semibold text-amber-800">
                {d.docType.label}
              </p>
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(d.caseDoc.ocrResult!).map(([key, value]) => (
                    <tr key={key} className="border-b border-amber-100 last:border-0">
                      <td className="py-1 pr-3 font-medium text-amber-700 whitespace-nowrap">
                        {key}
                      </td>
                      <td className="py-1 text-black/70">
                        {typeof value === 'string'
                          ? value || '—'
                          : JSON.stringify(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManualInputStep({ caseData, onNext, onPrev }: ManualInputStepProps) {
  const setManualField = useCaseStore((s) => s.setManualField);
  const values = caseData.manualFields ?? {};

  const { fields, sectionFields, visibleSections } = useMemo(() => {
    const f = getFieldsForVisa(caseData.visaType);
    const sf: Record<string, ManualFieldDef[]> = {};
    for (const field of f) {
      if (!sf[field.section]) sf[field.section] = [];
      sf[field.section].push(field);
    }
    const vs = sectionOrder.filter((sec) => {
      const meta = sectionMeta[sec];
      if (meta.visaFilter && !meta.visaFilter.includes(caseData.visaType)) return false;
      return sf[sec] && sf[sec].length > 0;
    });
    return { fields: f, sectionFields: sf, visibleSections: vs };
  }, [caseData.visaType]);

  const requiredFields = fields.filter((f) => f.required);
  const filledRequired = requiredFields.filter((f) => values[f.id]?.trim()).length;
  const totalFilled = fields.filter((f) => values[f.id]?.trim()).length;
  const canProceed = filledRequired === requiredFields.length;

  const handleChange = (fieldId: string, value: string) => {
    setManualField(caseData.id, fieldId, value);
  };

  return (
    <div>
      <OcrDebugPanel caseData={caseData} />

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
              badge={meta.badge}
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
