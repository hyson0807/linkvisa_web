'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCaseStore } from '@/store/case-store';
import { visaEntityConfig, visaTypes } from '@/lib/document-registry';
import type { ApplicationType } from '@/types/case';
import WizardLayout from './WizardLayout';
import StepApplicationType from './StepApplicationType';
import StepVisaType from './StepVisaType';
import StepForeignerName from './StepForeignerName';
import StepEntityName from './StepEntityName';

function getBaseVisaCode(code: string): string {
  const parts = code.split('-');
  return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : code;
}

function needsEntityStep(visaCode: string): boolean {
  const base = getBaseVisaCode(visaCode);
  return visaEntityConfig[base] !== null && visaEntityConfig[base] !== undefined;
}

export default function NewCaseWizard() {
  const router = useRouter();
  const createCase = useCaseStore((s) => s.createCase);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [applicationType, setApplicationType] = useState<ApplicationType | null>(null);
  const [visaType, setVisaType] = useState('');
  const [foreignerName, setForeignerName] = useState('');
  const [entityName, setEntityName] = useState('');

  const totalSteps = visaType && needsEntityStep(visaType) ? 4 : 3;

  const goForward = useCallback(() => {
    setDirection('forward');
    setStep((s) => s + 1);
  }, []);

  const goBack = useCallback(() => {
    setDirection('backward');
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const handleApplicationSelect = useCallback((type: ApplicationType) => {
    setApplicationType(type);
    setTimeout(() => goForward(), 300);
  }, [goForward]);

  const handleVisaSelect = useCallback((code: string) => {
    setVisaType(code);
    setTimeout(() => goForward(), 300);
  }, [goForward]);

  const handleCreateCase = useCallback(() => {
    if (!foreignerName.trim() || !visaType) return;

    const baseVisa = getBaseVisaCode(visaType);
    const companyName = entityName.trim() || '';
    const id = createCase(foreignerName.trim(), companyName, baseVisa, applicationType ?? undefined);
    router.push(`/cases/${id}`);
  }, [foreignerName, visaType, entityName, applicationType, createCase, router]);

  const showSubmitOnNameStep = visaType ? !needsEntityStep(visaType) : false;

  const handleNameNext = useCallback(() => {
    if (showSubmitOnNameStep) {
      handleCreateCase();
    } else {
      goForward();
    }
  }, [showSubmitOnNameStep, handleCreateCase, goForward]);

  const entityConfig = visaType ? visaEntityConfig[getBaseVisaCode(visaType)] : null;

  return (
    <WizardLayout step={step} totalSteps={totalSteps} direction={direction} onBack={goBack}>
      {step === 1 && (
        <StepApplicationType value={applicationType} onSelect={handleApplicationSelect} />
      )}
      {step === 2 && (
        <StepVisaType value={visaType} onSelect={handleVisaSelect} />
      )}
      {step === 3 && (
        <StepForeignerName
          value={foreignerName}
          onChange={setForeignerName}
          showSubmit={showSubmitOnNameStep}
          onSubmit={handleNameNext}
        />
      )}
      {step === 4 && entityConfig && (
        <StepEntityName
          label={entityConfig.label}
          placeholder={entityConfig.placeholder}
          value={entityName}
          onChange={setEntityName}
          onSubmit={handleCreateCase}
        />
      )}
    </WizardLayout>
  );
}
