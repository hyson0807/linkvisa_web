'use client';

import { useState } from 'react';
import { visaTypes } from '@/lib/document-registry';

interface StepVisaTypeProps {
  value: string;
  onSelect: (visaCode: string) => void;
}

export default function StepVisaType({ value, onSelect }: StepVisaTypeProps) {
  const [selectedMajor, setSelectedMajor] = useState<string | null>(() => {
    if (!value) return null;
    const visa = visaTypes.find((v) => v.code === value);
    if (visa) return value;
    for (const v of visaTypes) {
      if (v.subtypes?.some((s) => s.code === value)) return v.code;
    }
    return null;
  });

  const majorVisa = selectedMajor ? visaTypes.find((v) => v.code === selectedMajor) : null;
  const subtypes = majorVisa?.subtypes;

  const handleMajorSelect = (code: string) => {
    setSelectedMajor(code);
    const visa = visaTypes.find((v) => v.code === code);
    if (!visa?.subtypes || visa.subtypes.length === 0) {
      onSelect(code);
    }
  };

  const handleSubtypeSelect = (code: string) => {
    onSelect(code);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-black/90">
        비자 유형을 선택해 주세요
      </h1>
      <p className="mt-2 text-base leading-relaxed text-black/45">
        대분류를 먼저 선택하면 세부 유형이 나타납니다
      </p>

      {/* 대분류 */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visaTypes.map((visa, i) => {
          const isSelected = selectedMajor === visa.code;
          return (
            <button
              key={visa.code}
              onClick={() => handleMajorSelect(visa.code)}
              className={`rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary/60 bg-[#EBF4FF] shadow-sm scale-[1.01]'
                  : 'border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-md'
              }`}
              style={{ animation: `fadeInUp 0.4s ease-out ${i * 50}ms both` }}
            >
              <div className="flex items-center gap-3">
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
                <div>
                  <span className="text-[17px] font-semibold text-black/80">{visa.code}</span>
                  <span className="ml-2 text-[15px] font-medium text-black/60">{visa.label}</span>
                  <p className="mt-0.5 text-sm text-black/40">{visa.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 소분류 */}
      {subtypes && subtypes.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-black/50">
            세부 유형 선택
          </p>
          <div className="flex flex-col gap-2.5 overflow-hidden">
            {subtypes.map((sub, i) => {
              const isSubSelected = value === sub.code;
              return (
                <button
                  key={sub.code}
                  onClick={() => handleSubtypeSelect(sub.code)}
                  className={`rounded-xl border px-5 py-3.5 text-left transition-all duration-200 ${
                    isSubSelected
                      ? 'border-primary/60 bg-[#EBF4FF] shadow-sm'
                      : 'border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-md'
                  }`}
                  style={{ animation: `fadeInUp 0.35s ease-out ${i * 50}ms both` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                        isSubSelected ? 'border-primary bg-primary' : 'border-black/15'
                      }`}
                    >
                      {isSubSelected && (
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="text-[15px] font-semibold text-black/75">{sub.code}</span>
                      <span className="ml-2 text-[15px] text-black/55">{sub.label}</span>
                      {sub.desc && (
                        <span className="ml-1.5 text-sm text-black/35">{sub.desc}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
