'use client';

import { applicationTypes } from '@/lib/document-registry';
import type { ApplicationType } from '@/types/case';

interface StepApplicationTypeProps {
  value: ApplicationType | null;
  onSelect: (type: ApplicationType) => void;
}

export default function StepApplicationType({ value, onSelect }: StepApplicationTypeProps) {
  const badgeTexts = ['가장 많이 처리', '자주 진행', '신규 비자'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-black/90">
        어떤 업무를 진행하시나요?
      </h1>
      <p className="mt-2 text-base leading-relaxed text-black/45">
        통합신청서 기준으로 선택해 주세요
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {applicationTypes.map((type, i) => {
          const isSelected = value === type.id;
          const isHighlighted = i < 3;

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id as ApplicationType)}
              className={`relative h-16 rounded-xl border px-5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary/60 bg-[#EBF4FF] shadow-sm'
                  : isHighlighted
                    ? 'border-2 border-[#4F6DF5] bg-white hover:border-[#3B5BDB]'
                    : 'border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-md'
              }`}
              style={{ animation: `fadeInUp 0.4s ease-out ${i * 50}ms both` }}
            >
              {isHighlighted && (
                <span className="absolute right-[14px] top-[10px] rounded-md bg-[#EEF2FF] px-2 py-1 text-[11px] font-semibold text-[#3B5BDB]">
                  {badgeTexts[i]}
                </span>
              )}
              <div className="flex h-full items-center gap-3">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                    isSelected ? 'border-primary bg-primary' : 'border-black/20'
                  }`}
                >
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className={`text-[16px] font-medium ${isSelected ? 'text-primary' : 'text-black/70'}`}>
                  {type.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
