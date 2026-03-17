'use client';

import { use, useState, useEffect } from 'react';
import CasesAppHeader from '../_components/AppHeader';
import StepIndicator from './_components/shared/StepIndicator';
import type { WizardStep } from './_components/shared/StepIndicator';
import UploadStep from './_components/step1-upload/UploadStep';
import FormConfirmStep from './_components/step2-form-confirm/FormConfirmStep';
import ReviewStep from './_components/step3-ocr/ReviewStep';
import OutputStep from './_components/step4-output/OutputStep';
import StudentLinkPanel from './_components/StudentLinkPanel';
import { useCaseStore } from '@/store/case-store';
import { visaTypes } from '@/lib/document-registry';

export default function CaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const fetchCase = useCaseStore((s) => s.fetchCase);
  const caseData = useCaseStore((s) => s.getCase(id));
  const [step, setStep] = useState<WizardStep>('upload');
  const [loading, setLoading] = useState(!caseData);

  useEffect(() => {
    fetchCase(id).finally(() => setLoading(false));
  }, [id, fetchCase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <CasesAppHeader />
        <main className="mx-auto max-w-4xl px-6 py-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      </div>
    );
  }

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
      <main className="mx-auto max-w-5xl px-6 py-4">
        {/* Unified header: case info + step indicator */}
        <div className="mb-4 flex h-12 items-center justify-between">
          {/* Left: Case info */}
          <span className="text-[14px] font-medium text-[#6B7280]">
            {caseData.visaType === 'D-2' ? caseData.companyName : caseData.foreignerName} · {caseData.visaType}
          </span>

          {/* Right: Step indicator inline */}
          <StepIndicator
            currentStep={step}
            onStepClick={(s) => setStep(s)}
          />
        </div>

        {/* D-2: 학생 서류 제출 링크 */}
        {caseData.visaType === 'D-2' && (
          <StudentLinkPanel caseData={caseData} />
        )}

        {/* Step content */}
        {step === 'upload' && (
          <UploadStep caseData={caseData} onNext={() => setStep('form-confirm')} />
        )}
        {step === 'form-confirm' && (
          <FormConfirmStep caseData={caseData} onNext={() => setStep('review')} onPrev={() => setStep('upload')} />
        )}
        {step === 'review' && (
          <ReviewStep caseData={caseData} onNext={() => setStep('output')} onPrev={() => setStep('form-confirm')} />
        )}
        {step === 'output' && (
          <OutputStep caseData={caseData} onPrev={() => setStep('review')} />
        )}
      </main>
    </div>
  );
}
