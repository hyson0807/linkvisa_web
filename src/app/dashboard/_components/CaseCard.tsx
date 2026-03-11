'use client';

import Link from 'next/link';
import type { Case } from '@/types/case';

const stepLabels = ['서류 업로드', '자동 작성 확인', '추가 정보 입력', '공문서 완성'];

function getStepIndex(status: Case['status']): number {
  switch (status) {
    case 'draft':
    case 'documents-pending':
      return 0;
    case 'ocr-in-progress':
      return 1;
    case 'generation-ready':
      return 2;
    case 'complete':
      return 3;
    default:
      return 0;
  }
}

export default function CaseCard({
  caseData,
  onDelete,
}: {
  caseData: Case;
  onDelete?: (id: string) => void;
}) {
  const currentStep = getStepIndex(caseData.status);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`"${caseData.foreignerName}" 케이스를 삭제하시겠습니까?`)) {
      onDelete?.(caseData.id);
    }
  };

  return (
    <Link
      href={`/cases/${caseData.id}`}
      className="group relative block rounded-2xl border border-black/[0.04] bg-white px-7 py-7 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-black/25 transition-all hover:bg-red-50 hover:text-red-500"
        aria-label="케이스 삭제"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="text-[30px] font-bold tracking-tight text-black/85 mb-2 pr-8">
        {caseData.foreignerName}
      </div>

      <div className="flex items-center gap-2.5 text-[20px] text-black/45 mb-6">
        <span>{caseData.companyName}</span>
        <span className="text-black/15">|</span>
        <span className="text-primary-dark/70 font-medium">{caseData.visaType}</span>
      </div>

      {/* 4-step progress */}
      <div className="flex items-center gap-1.5">
        {stepLabels.map((label, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`h-1.5 w-full rounded-full transition-all ${
                  isDone || isActive
                    ? 'bg-primary'
                    : 'bg-black/[0.12]'
                }`}
              />
              <span
                className={`text-[13px] leading-tight text-center transition-colors ${
                  isDone || isActive
                    ? 'text-primary font-semibold'
                    : 'text-black/40'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
