'use client';

import { use, useState } from 'react';
import CasesAppHeader from '../_components/AppHeader';
import StepIndicator from './_components/shared/StepIndicator';
import type { WizardStep } from './_components/shared/StepIndicator';
import UploadStep from './_components/step1-upload/UploadStep';
import ReviewStep from './_components/step2-review/ReviewStep';
import ManualInputStep from './_components/step3-manual/ManualInputStep';
import OutputStep from './_components/step4-output/OutputStep';
import { useCaseStore } from '@/store/case-store';
import { visaTypes } from '@/lib/document-registry';

export default function CaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const caseData = useCaseStore((s) => s.getCase(id));
  const [step, setStep] = useState<WizardStep>('upload');

  if (!caseData) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <CasesAppHeader />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-black/40">케이스를 찾을 수 없습니다.</p>
        </main>
      </div>
    );
  }

  const visaLabel = visaTypes.find((v) => v.code === caseData.visaType);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <CasesAppHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Case header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {caseData.foreignerName.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-black/80">
              {caseData.foreignerName}
              <span className="ml-2 text-sm font-normal text-black/40">· {caseData.companyName}</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {caseData.visaType}
              </span>
              {visaLabel && (
                <span className="text-xs text-black/30">{visaLabel.label} · {visaLabel.desc}</span>
              )}
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator
          currentStep={step}
          onStepClick={(s) => setStep(s)}
        />

        {/* Step content */}
        {step === 'upload' && (
          <UploadStep caseData={caseData} onNext={() => setStep('review')} />
        )}
        {step === 'review' && (
          <ReviewStep caseData={caseData} onNext={() => setStep('manual-input')} onPrev={() => setStep('upload')} />
        )}
        {step === 'manual-input' && (
          <ManualInputStep caseData={caseData} onNext={() => setStep('output')} onPrev={() => setStep('upload')} />
        )}
        {step === 'output' && (
          <OutputStep caseData={caseData} onPrev={() => setStep('manual-input')} />
        )}
      </main>
    </div>
  );
}
