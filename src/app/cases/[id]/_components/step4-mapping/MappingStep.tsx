'use client';

import { useMemo, useState } from 'react';
import type { Case } from '@/types/case';
import '@/lib/pdf/forms';
import { getFormsForCase } from '@/lib/pdf/form-registry';
import { analyzeMappingStatus } from '@/lib/pdf/analyze';
import { useCaseStore } from '@/store/case-store';

interface MappingStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

export default function MappingStep({ caseData, onNext, onPrev }: MappingStepProps) {
  const forms = useMemo(() => getFormsForCase(caseData), [caseData]);
  const setManualField = useCaseStore((s) => s.setManualField);

  const [expandedFormId, setExpandedFormId] = useState<string | null>(
    forms.length > 0 ? forms[0].id : null,
  );

  // Local state for input fields — synced to store on blur
  const [localInputs, setLocalInputs] = useState<Record<string, string>>({});

  const formAnalyses = useMemo(
    () => forms.map((formDef) => ({
      formDef,
      analysis: analyzeMappingStatus(formDef, caseData),
    })),
    [forms, caseData],
  );

  const hasMappings = (formDef: typeof forms[0]) =>
    formDef.textFieldMappings.length > 0 || formDef.checkboxMappings.length > 0;

  const handleInputBlur = (pdfField: string, value: string) => {
    if (value.trim()) {
      setManualField(caseData.id, pdfField, value.trim());
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">매핑 확인</h2>
        <p className="mt-1 text-sm text-gray-500">
          PDF 양식에 매핑된 데이터를 확인하고, 미입력 필드를 직접 입력하세요.
        </p>
      </div>

      {/* Form accordions */}
      <div className="rounded-xl border border-black/5 bg-white shadow-sm">
        {formAnalyses.map(({ formDef, analysis }) => {
          const isExpanded = expandedFormId === formDef.id;
          const mappedCount = analysis.mapped.length;
          const unmappedCount = analysis.unmapped.length;
          const hasMappingData = hasMappings(formDef);

          return (
            <div key={formDef.id} className="border-b border-black/5 last:border-b-0">
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => setExpandedFormId(isExpanded ? null : formDef.id)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left hover:bg-black/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`h-3.5 w-3.5 text-black/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm font-semibold text-black/70">{formDef.label}</span>
                  {!hasMappingData && (
                    <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/30">준비중</span>
                  )}
                </div>
                {hasMappingData && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600">{mappedCount}개 매핑</span>
                    {unmappedCount > 0 && (
                      <span className="text-xs text-amber-600">{unmappedCount}개 미입력</span>
                    )}
                  </div>
                )}
              </button>

              {/* Accordion content */}
              {isExpanded && (
                <div className="px-5 pb-4">
                  {!hasMappingData ? (
                    <p className="text-xs text-black/30 py-2">PDF 템플릿 준비 후 매핑이 추가됩니다.</p>
                  ) : (
                    <>
                      {/* Mapped fields */}
                      {analysis.mapped.length > 0 && (
                        <div className="mb-4">
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
                              <div key={f.pdfField} className="rounded-md bg-emerald-50/50 px-3 py-2">
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
                        <div className="mb-4">
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

                      {/* Unmapped fields with input */}
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
                          <div className="space-y-1.5">
                            {analysis.unmapped.map((f) => (
                              <div key={f.pdfField} className="rounded-md bg-amber-50/50 px-3 py-2">
                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                  <span className="text-xs font-medium text-black/60">{f.label}</span>
                                  <span className="text-[10px] text-black/30">{f.pdfField}</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder={`${f.label} 입력`}
                                  value={localInputs[f.pdfField] ?? caseData.manualFields?.[f.pdfField] ?? ''}
                                  onChange={(e) => setLocalInputs((prev) => ({ ...prev, [f.pdfField]: e.target.value }))}
                                  onBlur={(e) => handleInputBlur(f.pdfField, e.target.value)}
                                  className="w-full rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs text-black/70 placeholder:text-black/25 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                                />
                                <p className="mt-1 text-[10px] text-black/30">{f.sourceDesc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 데이터 추출
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          공문서 확인 →
        </button>
      </div>
    </div>
  );
}
