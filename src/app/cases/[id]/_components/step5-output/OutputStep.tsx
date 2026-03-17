'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Case } from '@/types/case';
import '@/lib/pdf/forms';
import { getFormsForCase } from '@/lib/pdf/form-registry';
import { fillFormPdf } from '@/lib/pdf/pdf-filler';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import GuestSaveBanner from './GuestSaveBanner';

interface OutputStepProps {
  caseData: Case;
  onPrev: () => void;
}

export default function OutputStep({ caseData, onPrev }: OutputStepProps) {
  const forms = useMemo(() => getFormsForCase(caseData), [caseData]);
  const { downloading, downloadingFormId, downloadForm, downloadAll } = usePdfDownload(caseData);

  const [activeFormId, setActiveFormId] = useState<string>(
    forms.length > 0 ? forms[0].id : '',
  );

  const previewForm = useMemo(
    () => forms.find((f) => f.id === activeFormId) ?? forms[0],
    [forms, activeFormId],
  );

  const hasMappings = (formDef: (typeof forms)[number]) =>
    formDef.textFieldMappings.length > 0 || formDef.checkboxMappings.length > 0;

  const activeHasMappings = previewForm ? hasMappings(previewForm) : false;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!previewForm || !activeHasMappings) {
      setPreviewUrl(null);
      setPreviewLoading(false);
      return;
    }
    let revoked = false;

    setPreviewLoading(true);
    fillFormPdf(previewForm, caseData)
      .then((pdfBytes) => {
        if (revoked) return;
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      })
      .catch((err) => {
        console.error('PDF preview failed:', err);
      })
      .finally(() => {
        if (!revoked) setPreviewLoading(false);
      });

    return () => {
      revoked = true;
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [previewForm, caseData]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">공문서 완성</h2>
          <p className="mt-1 text-sm text-gray-500">
            작성된 서류를 미리보기로 확인하고 다운로드하세요.
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">
          {forms.length}개 양식
        </span>
      </div>

      <GuestSaveBanner />

      {/* PDF Preview */}
      <div className="mb-6 rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-black/5 overflow-x-auto">
          {forms.map((formDef) => {
            const isActive = activeFormId === formDef.id;
            const hasMappingData = hasMappings(formDef);

            return (
              <button
                key={formDef.id}
                type="button"
                onClick={() => setActiveFormId(formDef.id)}
                className={`relative shrink-0 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-white'
                    : 'bg-black/[0.02] hover:bg-black/[0.04]'
                }`}
              >
                <span className={`block text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'text-primary' : 'text-black/50'
                }`}>
                  {formDef.label}
                </span>
                {!hasMappingData && (
                  <span className="block mt-0.5 text-[10px] text-black/25">준비중</span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeHasMappings ? (
          previewLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full border-0"
              style={{ height: '70vh' }}
              title="PDF 미리보기"
            />
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-black/40">PDF를 생성할 수 없습니다.</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm font-medium text-black/30">준비중</p>
            <p className="mt-1 text-xs text-black/20">PDF 템플릿 준비 후 미리보기가 제공됩니다.</p>
          </div>
        )}
      </div>

      {/* Per-form download buttons */}
      <div className="mb-6 rounded-xl border border-black/5 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-black/70 mb-3">양식별 다운로드</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {forms.map((formDef) => {
            const hasMappings = formDef.textFieldMappings.length > 0 || formDef.checkboxMappings.length > 0;
            if (!hasMappings) return null;
            return (
              <button
                key={formDef.id}
                type="button"
                onClick={() => downloadForm(formDef.id)}
                disabled={downloading}
                className="rounded-lg border border-black/10 px-4 py-2.5 text-left text-sm font-medium text-black/60 hover:bg-black/[0.02] disabled:opacity-50"
              >
                {downloadingFormId === formDef.id ? '다운로드 중...' : formDef.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 매핑 확인
        </button>
        <button
          type="button"
          onClick={downloadAll}
          disabled={downloading}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50"
        >
          {downloading ? '다운로드 중...' : '전체 양식 다운로드 (PDF)'}
        </button>
      </div>
    </div>
  );
}
