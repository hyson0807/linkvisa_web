'use client';

import { useState } from 'react';
import type { DocWithType } from '@/types/case';

interface UploadedDocsChecklistProps {
  docs: DocWithType[];
}

function isDocDone(d: DocWithType): boolean {
  return !!d.caseDoc.file || d.caseDoc.status === 'ocr-complete' || d.caseDoc.status === 'complete';
}

function DocGroup({ heading, docs }: { heading: string; docs: DocWithType[] }) {
  if (docs.length === 0) return null;
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-black/40 uppercase tracking-wide">
        {heading}
      </div>
      <div className="space-y-2">
        {docs.map(({ caseDoc, docType }) => {
          const done = isDocDone({ caseDoc, docType });
          return (
            <div key={caseDoc.id} className="flex items-center gap-3">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${done ? 'bg-green-100 text-green-600' : 'border border-black/10'}`}>
                {done && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${done ? 'text-black/70' : 'text-black/35'}`}>
                {docType.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UploadedDocsChecklist({ docs }: UploadedDocsChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);

  const foreignerDocs = docs.filter((d) => d.docType.category === 'foreigner');
  const companyDocs = docs.filter((d) => d.docType.category === 'company');

  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="text-sm font-semibold text-black/60">
          제출 서류 목록 ({docs.length}건)
        </span>
        <span className="text-sm text-black/30">
          {isOpen ? '접기' : '펼치기'}
          <svg
            className={`ml-1 inline-block h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-black/5 px-5 py-4 space-y-5">
          <DocGroup heading="외국인 서류" docs={foreignerDocs} />
          <DocGroup heading="사업체 서류" docs={companyDocs} />
        </div>
      )}
    </div>
  );
}
