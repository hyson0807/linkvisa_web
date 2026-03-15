'use client';

import { useEffect, useRef } from 'react';
import { useCaseStore } from '@/store/case-store';
import { resolveDocsWithType } from '@/lib/document-registry';
import { runMockOcr } from '@/lib/mock-ocr';
import { runMockAiGenerate } from '@/lib/mock-ai-generate';
import AutoFillShowcase from './AutoFillShowcase';
import { hasFiles } from '@/types/case';
import type { Case } from '@/types/case';

interface ReviewStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

function useDocsWithType(caseData: Case) {
  const all = resolveDocsWithType(caseData);

  const ocrDocs = all.filter(
    (d) => d.docType.source === 'upload' && d.docType.ocrFields && d.docType.ocrFields.length > 0
  );
  const formGenDocs = all.filter((d) => d.docType.source === 'form-generate');
  const aiDocs = all.filter((d) => d.docType.source === 'ai-generate');
  const hasAnyUpload = all.some((d) => d.docType.source === 'upload' && hasFiles(d.caseDoc));

  return { ocrDocs, formGenDocs, aiDocs, hasAnyUpload };
}

export default function ReviewStep({ caseData, onNext, onPrev }: ReviewStepProps) {
  const autoProcessedRef = useRef(false);
  const setOcrResult = useCaseStore((s) => s.setOcrResult);
  const setAiContent = useCaseStore((s) => s.setAiContent);

  const { ocrDocs, formGenDocs, aiDocs, hasAnyUpload } = useDocsWithType(caseData);

  useEffect(() => {
    if (autoProcessedRef.current) return;
    autoProcessedRef.current = true;

    const caseId = caseData.id;
    const manualFields = caseData.manualFields;

    (async () => {
      for (const d of ocrDocs.filter((d) => !d.caseDoc.ocrResult && hasFiles(d.caseDoc))) {
        const result = await runMockOcr(d.docType.id);
        setOcrResult(caseId, d.caseDoc.id, result);
        await new Promise((r) => setTimeout(r, 400));
      }

      for (const d of formGenDocs.filter((d) => !d.caseDoc.ocrResult)) {
        const result = await runMockOcr(d.docType.id);
        setOcrResult(caseId, d.caseDoc.id, result);
        await new Promise((r) => setTimeout(r, 600));
      }

      for (const d of aiDocs.filter((d) => !d.caseDoc.aiContent)) {
        const content = await runMockAiGenerate(d.docType.id, '', manualFields);
        setAiContent(caseId, d.caseDoc.id, content);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasAnyUpload) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black/85">
            자동 작성 확인
          </h2>
          <p className="mt-1 text-sm text-black/40">
            업로드된 서류를 기반으로 공문서를 자동 작성합니다.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-black/6 bg-black/[0.02] p-10 text-center">
          <p className="mb-6 text-sm text-black/40">
            업로드된 서류가 없습니다
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onPrev}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              ← 서류 업로드
            </button>
            <button
              onClick={onNext}
              className="rounded-xl border border-black/10 px-6 py-2.5 text-sm font-medium text-black/50 hover:bg-black/3 transition-colors"
            >
              건너뛰기 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AutoFillShowcase onComplete={onNext} onPrev={onPrev} />;
}
