'use client';

import type { CaseDocument, DocumentTypeDef } from '@/types/case';

interface DocumentPreviewPaperProps {
  docType: DocumentTypeDef;
  caseDoc: CaseDocument;
  truncated?: boolean;
}

export default function DocumentPreviewPaper({ docType, caseDoc, truncated = false }: DocumentPreviewPaperProps) {
  if (docType.source === 'form-generate') {
    const fields = caseDoc.ocrResult ? Object.entries(caseDoc.ocrResult) : [];
    const displayFields = truncated ? fields.slice(0, 5) : fields;

    if (truncated) {
      return (
        <div className="paper-fade-bottom h-[180px] overflow-hidden rounded-xl border border-black/[0.03] bg-[#FAFAF8] p-4">
          <div className="mb-3 text-center text-[13px] font-semibold text-black/50">
            {docType.label}
          </div>
          <div className="space-y-1.5">
            {displayFields.map(([field, value]) => (
              <div key={field} className="flex gap-2 text-[13px]">
                <span className="w-20 shrink-0 text-black/35">{field}</span>
                <span className="text-black/70">{value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-black/[0.03] bg-[#FAFAF8] p-6">
        <div className="mb-5 text-center text-base font-semibold text-black/70">
          {docType.label}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {fields.map(([field, value]) => (
            <div key={field} className="flex flex-col gap-0.5">
              <span className="text-sm text-black/40">{field}</span>
              <span className="text-sm font-medium text-black/80">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (docType.source === 'ai-generate') {
    const content = caseDoc.aiContent ?? '';

    if (truncated) {
      return (
        <div className="paper-fade-bottom h-[180px] overflow-hidden rounded-xl border border-black/[0.03] bg-[#FAFAF8] p-4">
          <div className="mb-3 text-center text-[13px] font-semibold text-black/50">
            {docType.label}
          </div>
          <p className="text-[13px] leading-[1.7] text-black/60">
            {content.slice(0, 120)}
          </p>
        </div>
      );
    }

    return (
      <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-black/[0.03] bg-[#FAFAF8] p-6">
        <div className="mb-5 text-center text-base font-semibold text-black/70">
          {docType.label}
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-[1.8] text-black/70">
          {content}
        </pre>
      </div>
    );
  }

  return null;
}
