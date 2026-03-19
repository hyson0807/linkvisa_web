'use client';

import { useState } from 'react';
import { visaTypes } from '@/lib/document-registry';

const HIGHLIGHTED_VISAS = ['F-6', 'F-2', 'C-3'];

const VISA_REQUEST_EXAMPLES: Record<string, string> = {
  'F-6': '예: F-6-2, F-6-3',
  'F-2': '예: F-2-1, F-2-3',
  'C-3': '예: C-3-4, C-3-9',
  'E-7': '예: E-7-3, E-7-S',
  'D-4': '예: D-4-2, D-4-6',
  'D-2': '예: D-2-2, D-2-6',
  'F-5': '예: F-5-5, F-5-6',
};

interface StepVisaTypeProps {
  value: string;
  onSelect: (visaCode: string) => void;
}

export default function StepVisaType({ value, onSelect }: StepVisaTypeProps) {
  const [requestValue, setRequestValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRequest = () => {
    if (!requestValue.trim()) return;
    setSubmitted(true);
  };

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
        희망하는 비자를 선택해 주세요
      </h1>

      {/* 대분류 */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visaTypes.map((visa, i) => {
          const isSelected = selectedMajor === visa.code;
          const isHighlighted = HIGHLIGHTED_VISAS.includes(visa.code);
          return (
            <button
              key={visa.code}
              onClick={() => handleMajorSelect(visa.code)}
              className={`rounded-2xl border px-5 py-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary/60 bg-[#EBF4FF] shadow-sm scale-[1.01]'
                  : isHighlighted
                    ? 'border-2 border-[#4F6DF5] bg-white hover:border-[#3B5BDB] hover:shadow-md'
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
              const isPopular = 'popular' in sub && sub.popular;
              return (
                <button
                  key={sub.code}
                  onClick={() => handleSubtypeSelect(sub.code)}
                  className={`rounded-xl border px-5 py-3.5 text-left transition-all duration-200 ${
                    isSubSelected
                      ? 'border-primary/60 bg-[#EBF4FF] shadow-sm'
                      : isPopular
                        ? 'border-primary/50 bg-white hover:border-primary/70 hover:shadow-md'
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
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 비자 종류 요청 */}
      <div className="mt-12">
        <p className="text-[17px] font-bold text-black/80">
          필요한 비자 종류를 적어주세요!
        </p>

        {submitted ? (
          <div
            className="mt-3 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4"
            style={{ animation: 'fadeInUp 0.35s ease-out both' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M4 10.5l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-green-800">
                요청이 접수되었어요!
              </p>
              <p className="mt-0.5 text-[14px] text-green-600">
                빠르게 추가해 드릴게요. 조금만 기다려 주세요.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex gap-2.5">
            <input
              type="text"
              value={requestValue}
              onChange={(e) => setRequestValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitRequest(); }}
              placeholder={selectedMajor && VISA_REQUEST_EXAMPLES[selectedMajor] ? VISA_REQUEST_EXAMPLES[selectedMajor] : '예: E-9, F-4'}
              className="flex-1 rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-[15px] text-black/80 placeholder:text-black/30 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="button"
              onClick={handleSubmitRequest}
              className="shrink-0 rounded-xl bg-primary px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 active:bg-primary/80"
            >
              신청하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
