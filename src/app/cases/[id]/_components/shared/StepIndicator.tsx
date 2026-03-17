'use client';

export type WizardStep = 'upload' | 'form-confirm' | 'review' | 'output';

const publicSteps: { key: WizardStep; label: string }[] = [
  { key: 'upload', label: '서류업로드' },
  { key: 'form-confirm', label: '양식확인' },
  { key: 'review', label: '데이터추출' },
  { key: 'output', label: '공문서' },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

export default function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  const currentIndex = publicSteps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-1">
      {publicSteps.map((step, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;
        const isClickable = isDone && onStepClick;

        return (
          <div key={step.key} className="flex items-center">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(step.key)}
              className={`flex items-center gap-1.5 transition-all ${
                isDone ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                  isActive || isDone
                    ? 'bg-primary text-white'
                    : 'bg-black/10 text-black/30'
                }`}
              >
                {isDone ? (
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[13px] font-medium ${
                  isActive ? 'text-primary' : isDone ? 'text-primary-dark' : 'text-black/30'
                }`}
              >
                {step.label}
              </span>
            </button>
            {i < publicSteps.length - 1 && (
              <span className="mx-1.5 text-[13px] text-black/20">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
