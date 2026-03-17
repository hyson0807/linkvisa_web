'use client';

import { useMemo, useState } from 'react';
import { resolveDocsWithType } from '@/lib/document-registry';
import type { Case } from '@/types/case';

interface ManualInputStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

function OcrResultPanel({ caseData }: { caseData: Case }) {
  const [open, setOpen] = useState(true);
  const ocrDocs = useMemo(
    () => resolveDocsWithType(caseData).filter(
      (d) => d.caseDoc.ocrResult && Object.keys(d.caseDoc.ocrResult).length > 0,
    ),
    [caseData],
  );

  if (ocrDocs.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-black/70">
          OCR 추출 결과
        </span>
        <span className="text-xs text-black/40">{open ? '접기 ▲' : '펼치기 ▼'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {ocrDocs.map((d) => (
            <div key={d.caseDoc.id} className="rounded-lg bg-black/[0.02] p-3">
              <p className="mb-2 text-xs font-semibold text-black/60">
                {d.docType.label}
              </p>
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(d.caseDoc.ocrResult!).map(([key, value]) => (
                    <tr key={key} className="border-b border-black/5 last:border-0">
                      <td className="py-1 pr-3 font-medium text-black/50 whitespace-nowrap">
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
  return (
    <div>
      <OcrResultPanel caseData={caseData} />

      <div className="mt-8 flex justify-between">
        <button
          onClick={onPrev}
          className="rounded-xl border border-black/10 px-6 py-3 text-base font-medium text-black/50 hover:bg-black/3"
        >
          ← 서류 업로드 수정
        </button>
        <button
          onClick={onNext}
          className="rounded-xl px-8 py-3 text-base font-semibold transition-all bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-dark"
        >
          다음: 공문서 완성 →
        </button>
      </div>
    </div>
  );
}
