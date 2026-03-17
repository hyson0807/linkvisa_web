'use client';

import { useMemo } from 'react';
import type { Case } from '@/types/case';
import { analyzeMappingStatus } from '@/lib/pdf-field-map';
import { usePdfDownload } from '@/hooks/usePdfDownload';

interface PdfMappingPanelProps {
  caseData: Case;
}

export default function PdfMappingPanel({ caseData }: PdfMappingPanelProps) {
  const { downloading, download: handleDownload } = usePdfDownload(caseData);
  const analysis = useMemo(() => analyzeMappingStatus(caseData), [caseData]);

  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 px-4 py-3">
        <p className="text-sm font-semibold text-black/70">PDF 매핑 현황</p>
        <p className="mt-0.5 text-xs text-black/40">
          통합신청서 필드에 자동 매핑된 데이터
        </p>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
        {/* Mapped fields */}
        {analysis.mapped.length > 0 && (
          <div className="border-b border-black/5 px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                매핑 완료 ({analysis.mapped.length})
              </span>
            </div>
            <div className="space-y-1">
              {analysis.mapped.map((f) => (
                <div key={f.pdfField} className="rounded-md bg-emerald-50/50 px-2 py-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-black/60">{f.label}</span>
                    <span className="text-[10px] text-black/30">{f.pdfField}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-black/70 break-all">{f.value}</p>
                  <p className="mt-0.5 text-[10px] text-black/30">{f.sourceDesc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checked checkboxes */}
        {analysis.checkedBoxes.length > 0 && (
          <div className="border-b border-black/5 px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-blue-700">
                체크박스 ({analysis.checkedBoxes.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.checkedBoxes.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Unmapped fields */}
        {analysis.unmapped.length > 0 && (
          <div className="px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5a1 1 0 11-2 0V4a1 1 0 011-1zm0 10a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
              </span>
              <span className="text-xs font-semibold text-amber-700">
                미매핑 ({analysis.unmapped.length})
              </span>
            </div>
            <div className="space-y-1">
              {analysis.unmapped.map((f, i) => (
                <div key={`${f.docLabel}-${f.key}-${i}`} className="rounded-md bg-amber-50/50 px-2 py-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-black/60">{f.key}</span>
                    <span className="text-[10px] text-black/30">{f.docLabel}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-black/50 break-all">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download button */}
      <div className="border-t border-black/5 px-4 py-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {downloading ? '다운로드 중...' : '통합신청서 다운로드 (PDF)'}
        </button>
      </div>
    </div>
  );
}
