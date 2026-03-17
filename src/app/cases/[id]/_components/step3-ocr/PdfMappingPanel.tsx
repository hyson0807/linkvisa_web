'use client';

import { useMemo, useState } from 'react';
import type { Case } from '@/types/case';
import '@/lib/pdf/forms';
import { getFormsForCase } from '@/lib/pdf/form-registry';
import { analyzeMappingStatus } from '@/lib/pdf/analyze';
import { usePdfDownload } from '@/hooks/usePdfDownload';

interface PdfMappingPanelProps {
  caseData: Case;
}

export default function PdfMappingPanel({ caseData }: PdfMappingPanelProps) {
  const { downloading, downloadingFormId, downloadForm, downloadAll } = usePdfDownload(caseData);
  const forms = useMemo(() => getFormsForCase(caseData), [caseData]);
  const [expandedFormId, setExpandedFormId] = useState<string | null>(
    forms.length > 0 ? forms[0].id : null,
  );

  const formAnalyses = useMemo(
    () => forms.map((formDef) => ({
      formDef,
      analysis: analyzeMappingStatus(formDef, caseData),
    })),
    [forms, caseData],
  );

  const hasMappings = (formDef: typeof forms[0]) =>
    formDef.textFieldMappings.length > 0 || formDef.checkboxMappings.length > 0;

  return (
    <div className="rounded-xl border border-black/5 bg-white shadow-sm">
      <div className="border-b border-black/5 px-4 py-3">
        <p className="text-sm font-semibold text-black/70">PDF 매핑 현황</p>
        <p className="mt-0.5 text-xs text-black/40">
          {forms.length}개 양식에 자동 매핑된 데이터
        </p>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
        {formAnalyses.map(({ formDef, analysis }) => {
          const isExpanded = expandedFormId === formDef.id;
          const mappedCount = analysis.mapped.length;
          const hasMappingData = hasMappings(formDef);

          return (
            <div key={formDef.id} className="border-b border-black/5 last:border-b-0">
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => setExpandedFormId(isExpanded ? null : formDef.id)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-black/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`h-3 w-3 text-black/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-semibold text-black/70">{formDef.label}</span>
                  {!hasMappingData && (
                    <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/30">준비중</span>
                  )}
                </div>
                {hasMappingData && (
                  <span className="text-[10px] text-black/40">
                    {mappedCount}개 매핑
                  </span>
                )}
              </button>

              {/* Accordion content */}
              {isExpanded && (
                <div className="px-4 pb-3">
                  {!hasMappingData ? (
                    <p className="text-xs text-black/30 py-2">PDF 템플릿 준비 후 매핑이 추가됩니다.</p>
                  ) : (
                    <>
                      {/* Mapped fields */}
                      {analysis.mapped.length > 0 && (
                        <div className="mb-3">
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
                        <div className="mb-3">
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
                        <div>
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3a1 1 0 011 1v5a1 1 0 11-2 0V4a1 1 0 011-1zm0 10a1 1 0 100 2 1 1 0 000-2z" />
                              </svg>
                            </span>
                            <span className="text-xs font-semibold text-amber-700">
                              미입력 ({analysis.unmapped.length})
                            </span>
                          </div>
                          <div className="space-y-1">
                            {analysis.unmapped.map((f) => (
                              <div key={f.pdfField} className="rounded-md bg-amber-50/50 px-2 py-1.5">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="text-xs font-medium text-black/60">{f.label}</span>
                                  <span className="text-[10px] text-black/30">{f.pdfField}</span>
                                </div>
                                <p className="mt-0.5 text-[10px] text-black/30">{f.sourceDesc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Per-form download button */}
                      <button
                        type="button"
                        onClick={() => downloadForm(formDef.id)}
                        disabled={downloading}
                        className="mt-3 w-full rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-black/60 hover:bg-black/[0.02] disabled:opacity-50"
                      >
                        {downloadingFormId === formDef.id ? '다운로드 중...' : `${formDef.label} 다운로드`}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Download all button */}
      <div className="border-t border-black/5 px-4 py-3">
        <button
          type="button"
          onClick={downloadAll}
          disabled={downloading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {downloading ? '다운로드 중...' : '전체 양식 다운로드 (PDF)'}
        </button>
      </div>
    </div>
  );
}
