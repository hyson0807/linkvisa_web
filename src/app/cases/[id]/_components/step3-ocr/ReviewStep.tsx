'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  const setOcrResult = useCaseStore((s) => s.setOcrResult);
  const setAiContent = useCaseStore((s) => s.setAiContent);
  const cancelRef = useRef<(() => void) | undefined>(undefined);

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

  const runOcrProcess = useCallback(() => {
    cancelRef.current?.();
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setStatus('processing');
    setCurrentDocName('');

    const caseId = caseData.id;
    const manualFields = caseData.manualFields;

    (async () => {
      await Promise.allSettled([
        // 1) Upload docs → real OCR
        (async () => {
          for (const d of resolved.ocrDocs.filter((d) => !hasFiles(d.caseDoc) && d.caseDoc.ocrResult)) {
            setOcrResult(caseId, d.caseDoc.id, {});
          }
          for (const d of resolved.ocrDocs.filter((d) => hasFiles(d.caseDoc))) {
            if (cancelled) return;
            setCurrentDocName(d.docType.label);
            try {
              const { result } = await caseApi.runOcr(caseId, d.caseDoc.id);
              if (!cancelled) setOcrResult(caseId, d.caseDoc.id, result);
            } catch (err) {
              console.error(`OCR failed for ${d.docType.id}:`, err);
              if (!cancelled) setOcrResult(caseId, d.caseDoc.id, {});
            }
          }
        })(),
        // 2) Form-generate docs → mock OCR (skip if already done)
        (async () => {
          for (const d of resolved.formGenDocs.filter((d) => !d.caseDoc.ocrResult)) {
            if (cancelled) return;
            setCurrentDocName(d.docType.label);
            const result = await runMockOcr(d.docType.id);
            if (!cancelled) setOcrResult(caseId, d.caseDoc.id, result);
          }
        })(),
        // 3) AI-generate docs → mock AI generate (skip if already done)
        (async () => {
          for (const d of resolved.aiDocs.filter((d) => !d.caseDoc.aiContent)) {
            if (cancelled) return;
            setCurrentDocName(d.docType.label);
            const content = await runMockAiGenerate(d.docType.id, '', manualFields);
            if (!cancelled) setAiContent(caseId, d.caseDoc.id, content);
          }
        })(),
      ]);

      if (!cancelled) setStatus('done');
    })();
  }, [caseData.id, caseData.manualFields, resolved, setOcrResult, setAiContent]);

  useEffect(() => {
    if (ocrResultDocs.length > 0) {
      setStatus('done');
    } else {
      runOcrProcess();
    }

    return () => { cancelRef.current?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">데이터 추출</h2>
          <p className="mt-1 text-sm text-gray-500">
            업로드된 서류에서 데이터를 추출하고 양식을 자동 작성합니다.
          </p>
        </div>
        {status === 'done' && (
          <button
            type="button"
            onClick={runOcrProcess}
            className="shrink-0 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/60 hover:bg-black/[0.03] hover:text-black/80 transition-colors"
          >
            다시 추출하기
          </button>
        )}
      </div>

      {/* Processing state */}
      {status === 'processing' && (
        <div className="mx-auto max-w-2xl rounded-xl border border-black/5 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-black/70">데이터 추출 중입니다...</p>
          {currentDocName && (
            <p className="mt-1 text-xs text-black/40">{currentDocName}</p>
          )}
        </div>
      )}

      {/* Done state */}
      {status === 'done' && (
        <div>
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
        </div>
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
            매핑 확인 →
          </button>
        )}
      </div>
    </div>
  );
}
