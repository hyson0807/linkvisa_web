'use client';

import { useState } from 'react';
import { hasFiles } from '@/types/case';
import type { DocWithType } from '@/types/case';
import DocumentSlot from './DocumentSlot';

function ProviderColumn({
  title,
  icon,
  iconBg,
  iconColor,
  docs,
  caseId,
  providerId,
  shareToken,
  onAddCustom,
  onCopyLink,
  onDeleteDoc,
  onEditLabel,
}: {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  docs: DocWithType[];
  caseId: string;
  providerId: string;
  shareToken?: string;
  onAddCustom: () => void;
  onCopyLink: (providerId: string) => void;
  onDeleteDoc: (docId: string) => void;
  onEditLabel: (docId: string, currentLabel: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const doneCount = docs.filter((d) => hasFiles(d.caseDoc)).length;

  const handleCopy = () => {
    onCopyLink(providerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkUrl = shareToken
    ? (typeof window !== 'undefined' ? `${window.location.origin}/submit/${shareToken}` : `/submit/${shareToken}`)
    : `링크 복사 버튼을 눌러주세요`;

  return (
    <div className="flex h-full flex-col">
      {/* 요청 링크 복사 카드 */}
      <div className={`mb-3 flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
        copied
          ? 'border-green-200 bg-green-50'
          : 'border-primary/10 bg-primary/[0.02] hover:border-primary/20 hover:bg-primary/[0.04]'
      }`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          copied ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
        }`}>
          {copied ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-black/60">
            {linkUrl}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {copied ? '복사됨' : '링크 복사'}
        </button>
      </div>

      {/* Card */}
      <div className="flex flex-1 flex-col rounded-2xl border border-black/5 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-black/5 px-5 py-4">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
            {icon}
          </div>
          <h3 className="text-[15px] font-bold text-black/70">{title}</h3>
          <span className="ml-auto text-sm font-medium text-black/30">
            {doneCount}/{docs.length}
          </span>
        </div>

      {/* Document list */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {docs.map(({ caseDoc, docType }) => (
          <DocumentSlot key={caseDoc.id} docType={docType} caseDoc={caseDoc} caseId={caseId} onDelete={onDeleteDoc} onEditLabel={onEditLabel} />
        ))}
        <button
          onClick={onAddCustom}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/8 py-3 text-[14px] font-medium text-black/30 hover:border-primary/30 hover:text-primary/60 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          서류 직접 추가
        </button>
      </div>
      </div>
    </div>
  );
}

export default ProviderColumn;
