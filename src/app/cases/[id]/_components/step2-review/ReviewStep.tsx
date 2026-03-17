'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useCaseStore } from '@/store/case-store';
import { resolveDocsWithType } from '@/lib/document-registry';
import { caseApi } from '@/lib/case-api';
import { runMockOcr } from '@/lib/mock-ocr';
import { runMockAiGenerate } from '@/lib/mock-ai-generate';
import { hasFiles } from '@/types/case';
import type { Case } from '@/types/case';

interface ReviewStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

type OcrStatus = 'processing' | 'done';

export default function ReviewStep({ caseData, onNext, onPrev }: ReviewStepProps) {
  const [status, setStatus] = useState<OcrStatus>('processing');
  const [currentDocName, setCurrentDocName] = useState('');
  const processedRef = useRef(false);
  const setOcrResult = useCaseStore((s) => s.setOcrResult);
  const setAiContent = useCaseStore((s) => s.setAiContent);

  const resolved = useMemo(() => {
    const all = resolveDocsWithType(caseData);
    return {
      ocrDocs: all.filter((d) => d.docType.source === 'upload'),
      formGenDocs: all.filter((d) => d.docType.source === 'form-generate'),
      aiDocs: all.filter((d) => d.docType.source === 'ai-generate'),
    };
  }, [caseData]);

  const ocrResultDocs = useMemo(
    () => resolved.ocrDocs.filter(
      (d) =>
        d.caseDoc.ocrResult &&
        Object.keys(d.caseDoc.ocrResult).length > 0,
    ),
    [resolved],
  );

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const caseId = caseData.id;
    const manualFields = caseData.manualFields;

    (async () => {
      await Promise.allSettled([
        // 1) Upload docs → real OCR
        (async () => {
          for (const d of resolved.ocrDocs.filter((d) => hasFiles(d.caseDoc))) {
            setCurrentDocName(d.docType.label);
            try {
              const { result } = await caseApi.runOcr(caseId, d.caseDoc.id);
              setOcrResult(caseId, d.caseDoc.id, result);
            } catch (err) {
              console.error(`OCR failed for ${d.docType.id}:`, err);
              setOcrResult(caseId, d.caseDoc.id, {});
            }
          }
        })(),
        // 2) Form-generate docs → mock OCR
        (async () => {
          for (const d of resolved.formGenDocs.filter((d) => !d.caseDoc.ocrResult)) {
            setCurrentDocName(d.docType.label);
            const result = await runMockOcr(d.docType.id);
            setOcrResult(caseId, d.caseDoc.id, result);
          }
        })(),
        // 3) AI-generate docs → mock AI generate
        (async () => {
          for (const d of resolved.aiDocs.filter((d) => !d.caseDoc.aiContent)) {
            setCurrentDocName(d.docType.label);
            const content = await runMockAiGenerate(d.docType.id, '', manualFields);
            setAiContent(caseId, d.caseDoc.id, content);
          }
        })(),
      ]);

      setStatus('done');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">데이터 추출</h2>
        <p className="mt-1 text-sm text-gray-500">
          업로드된 서류에서 데이터를 추출하고 양식을 자동 작성합니다.
        </p>
      </div>

      {/* Processing state */}
      {status === 'processing' && (
        <div className="rounded-xl border border-black/5 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-black/70">데이터 추출 중입니다...</p>
          {currentDocName && (
            <p className="mt-1 text-xs text-black/40">{currentDocName}</p>
          )}
        </div>
      )}

      {/* Done state: OCR results */}
      {status === 'done' && (
        <>
          {ocrResultDocs.length > 0 ? (
            <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-black/70 mb-3">추출 결과</p>
              <div className="space-y-3">
                {ocrResultDocs.map((d) => (
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
            </div>
          ) : (
            <div className="rounded-xl border border-black/5 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-black/40">추출된 데이터가 없습니다.</p>
            </div>
          )}
        </>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 양식 확인
        </button>

        {status === 'done' && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            다음 단계로 →
          </button>
        )}
      </div>
    </div>
  );
}
