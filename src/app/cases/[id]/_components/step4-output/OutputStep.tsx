'use client';

import { useMemo, useState } from 'react';
import { resolveDocsWithType } from '@/lib/document-registry';
import type { Case, CaseDocument, DocumentTypeDef } from '@/types/case';
import GeneratedDocCard from './GeneratedDocCard';
import DocumentInspectModal from './DocumentInspectModal';
import UploadedDocsChecklist from './UploadedDocsChecklist';
import GuestSaveBanner from './GuestSaveBanner';

interface OutputStepProps {
  caseData: Case;
  onPrev: () => void;
}

export default function OutputStep({ caseData, onPrev }: OutputStepProps) {
  const docsWithType = useMemo(() => resolveDocsWithType(caseData), [caseData]);

  const generatedDocs = docsWithType.filter(
    (d) => d.docType.source === 'form-generate' || d.docType.source === 'ai-generate'
  );
  const uploadedDocs = docsWithType.filter(
    (d) => d.docType.source === 'upload' || d.docType.source === 'ocr'
  );

  const [inspectDoc, setInspectDoc] = useState<{ docType: DocumentTypeDef; caseDoc: CaseDocument } | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black/85">공문서 완성</h2>
          <p className="mt-1 text-sm text-black/40">
            작성된 서류를 확인하고 다운로드하세요
          </p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">
          {generatedDocs.length}건 완성
        </span>
      </div>

      <GuestSaveBanner />

      <div className="mb-8">
        <h3 className="mb-4 text-base font-bold text-black/70">작성 완료된 서류</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {generatedDocs.map(({ caseDoc, docType }, i) => (
            <GeneratedDocCard
              key={caseDoc.id}
              docType={docType}
              caseDoc={caseDoc}
              index={i}
              onInspect={() => setInspectDoc({ docType, caseDoc })}
            />
          ))}
        </div>
      </div>

      {uploadedDocs.length > 0 && (
        <div className="mb-8">
          <UploadedDocsChecklist docs={uploadedDocs} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="rounded-xl border border-black/10 px-6 py-3 text-sm font-medium text-black/50 hover:bg-black/3"
        >
          ← 추가 정보 입력
        </button>
        <button className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark">
          전체 다운로드 (ZIP)
        </button>
      </div>

      <DocumentInspectModal
        isOpen={!!inspectDoc}
        onClose={() => setInspectDoc(null)}
        docType={inspectDoc?.docType ?? null}
        caseDoc={inspectDoc?.caseDoc ?? null}
        caseData={caseData}
      />
    </div>
  );
}
