'use client';

import type { CaseDocument, DocumentTypeDef } from '@/types/case';
import DocumentPreviewPaper from './DocumentPreviewPaper';

interface GeneratedDocCardProps {
  docType: DocumentTypeDef;
  caseDoc: CaseDocument;
  index: number;
  onInspect: () => void;
}

export default function GeneratedDocCard({ docType, caseDoc, index, onInspect }: GeneratedDocCardProps) {
  return (
    <div
      className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
      style={{ animation: `fadeInUp 0.4s ease-out ${index * 100}ms both` }}
    >
      <DocumentPreviewPaper docType={docType} caseDoc={caseDoc} truncated />

      <div className="mt-4">
        <div className="text-base font-bold text-black/80">{docType.label}</div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-green-600">작성 완료</span>
        </div>
      </div>

      <button
        onClick={onInspect}
        className="mt-4 w-full rounded-xl border border-primary/30 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5"
      >
        서류 확인하기
      </button>
    </div>
  );
}
