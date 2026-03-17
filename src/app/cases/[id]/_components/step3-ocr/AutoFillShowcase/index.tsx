'use client';

import { useState, useCallback, useRef } from 'react';
import { TIMING, SHOWCASE_DOCUMENTS, PHASE_LABELS } from './constants';
import DocumentCard from './DocumentCard';

interface AutoFillShowcaseProps {
  onComplete: () => void;
  onPrev?: () => void;
}

export default function AutoFillShowcase({ onComplete, onPrev }: AutoFillShowcaseProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const phaseCompletedRef = useRef<Record<number, number>>({});
  const hasTransitionedRef = useRef<Record<number, boolean>>({});
  const hasCompletedRef = useRef(false);

  const completeShowcase = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    onComplete();
  }, [onComplete]);

  const handleDocComplete = useCallback((phaseIdx: number) => {
    const current = phaseCompletedRef.current[phaseIdx] || 0;
    phaseCompletedRef.current[phaseIdx] = current + 1;
    const docsInPhase = SHOWCASE_DOCUMENTS[phaseIdx].length;

    if (phaseCompletedRef.current[phaseIdx] >= docsInPhase) {
      if (phaseIdx < SHOWCASE_DOCUMENTS.length - 1) {
        if (!hasTransitionedRef.current[phaseIdx]) {
          hasTransitionedRef.current[phaseIdx] = true;
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentPhase(phaseIdx + 1);
            setIsTransitioning(false);
          }, TIMING.PHASE_TRANSITION);
        }
      } else {
        setTimeout(completeShowcase, TIMING.COMPLETE_DELAY);
      }
    }
  }, [completeShowcase]);

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-black/85">업로드된 서류에서 추출한 정보로 양식을 채우고 있습니다!</h2>
      </div>

      <div className="flex gap-3 mb-10">
        {PHASE_LABELS.map((label, idx) => {
          const isCompleted = idx < currentPhase;
          const isCurrent = idx === currentPhase;

          return (
            <div
              key={idx}
              className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-500 ${
                isCompleted
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : isCurrent
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-black/[0.03] text-black/30 border border-black/5'
              }`}
            >
              {isCompleted && (
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isCurrent && (
                <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin flex-shrink-0" />
              )}
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      <div
        className={`grid grid-cols-2 gap-4 mb-8 transition-all duration-700 ${
          isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        {SHOWCASE_DOCUMENTS[currentPhase]?.map((doc, idx) => (
          <DocumentCard
            key={`${currentPhase}-${doc.id}`}
            doc={doc}
            isActive={true}
            startDelay={idx * 500}
            onComplete={() => handleDocComplete(currentPhase)}
            cardIndex={idx}
          />
        ))}
      </div>

      <div className="mt-14 flex justify-between items-center">
        {onPrev ? (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 rounded-xl border border-black/10 px-5 py-2.5 text-sm font-medium text-black/50 hover:bg-black/[0.03] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            서류 업로드
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={completeShowcase}
          className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          애니메이션 스킵
        </button>
      </div>
    </div>
  );
}
