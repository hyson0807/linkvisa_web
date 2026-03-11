'use client';

export type WizardStep = 'upload' | 'manual-input' | 'review' | 'output';

const publicSteps: { key: Exclude<WizardStep, 'review'>; label: string }[] = [
  { key: 'upload', label: '서류 업로드' },
  { key: 'manual-input', label: '추가 정보 입력' },
  { key: 'output', label: '공문서 완성' },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const visualCurrentStep =
    currentStep === 'review' ? 'upload' : currentStep;
  const currentIndex = publicSteps.findIndex((s) => s.key === visualCurrentStep);

  return (
    <div className="mb-8 flex items-center justify-center">
      {publicSteps.map((step, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;
        const isClickable = isDone && onStepClick;
        const showReviewProgress = currentStep === 'review' && i === 0;

        return (
          <div key={step.key} className="flex items-center">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.key)}
              className={`flex items-center gap-3 rounded-xl px-5 py-3 transition-all ${
                isActive
                  ? 'bg-primary/10 ring-2 ring-primary/30'
                  : isDone
                    ? 'bg-primary/5 cursor-pointer hover:bg-primary/10'
                    : 'bg-black/2'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : isDone
                      ? 'bg-primary text-white'
                      : 'bg-black/10 text-black/30'
                }`}
              >
                {isDone ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[15px] font-semibold tracking-tight ${
                  isActive ? 'text-primary' : isDone ? 'text-primary-dark' : 'text-black/30'
                }`}
              >
                {step.label}
              </span>
            </button>
            {i < publicSteps.length - 1 && (
              <div className="mx-2 flex h-10 w-20 items-center justify-center">
                <div
                  className={`h-px w-full ${
                    i < currentIndex || showReviewProgress ? 'bg-primary' : 'bg-black/10'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
