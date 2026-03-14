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
  // E-7-1 → E-7, F-2-7 → F-2, etc.
  const parts = code.split('-');
  return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : code;
}

function needsEntityStep(visaCode: string): boolean {
  const base = getBaseVisaCode(visaCode);
  return visaEntityConfig[base] !== null && visaEntityConfig[base] !== undefined;
}

function isD2Visa(visaCode: string): boolean {
  return getBaseVisaCode(visaCode) === 'D-2';
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

  // D-2: 3단계 (신청유형 → 비자 → 학교명)
  // Entity 있는 비자: 4단계 (신청유형 → 비자 → 외국인명 → 사업체/학교명)
  // Entity 없는 비자: 3단계 (신청유형 → 비자 → 외국인명)
  const isD2 = visaType ? isD2Visa(visaType) : false;
  const totalSteps = isD2 ? 3 : (visaType && needsEntityStep(visaType) ? 4 : 3);

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

  // D-2: 학교명 입력 후 바로 케이스 생성 (외국인명은 학생이 링크로 입력)
  const handleD2CreateCase = useCallback(() => {
    if (!entityName.trim() || !visaType) return;

    const baseVisa = getBaseVisaCode(visaType);
    const id = createCase('', entityName.trim(), baseVisa, applicationType ?? undefined);
    router.push(`/cases/${id}`);
  }, [entityName, visaType, applicationType, createCase, router]);

  const handleCreateCase = useCallback(() => {
    if (!foreignerName.trim() || !visaType) return;

    const baseVisa = getBaseVisaCode(visaType);
    const companyName = entityName.trim() || '';
    const id = createCase(foreignerName.trim(), companyName, baseVisa, applicationType ?? undefined);
    router.push(`/cases/${id}`);
  }, [foreignerName, visaType, entityName, applicationType, createCase, router]);

  // Determine if Step 3 should show submit (when no entity step needed)
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

      {/* D-2: 3단계에서 학교명 입력 후 바로 생성 */}
      {step === 3 && isD2 && entityConfig && (
        <StepEntityName
          label={entityConfig.label}
          placeholder={entityConfig.placeholder}
          value={entityName}
          onChange={setEntityName}
          onSubmit={handleD2CreateCase}
        />
      )}

      {/* 일반 비자: 3단계 외국인명 */}
      {step === 3 && !isD2 && (
        <StepForeignerName
          value={foreignerName}
          onChange={setForeignerName}
          showSubmit={showSubmitOnNameStep}
          onSubmit={handleNameNext}
          visaType={visaType}
        />
      )}

      {/* 일반 비자: 4단계 사업체/배우자명 */}
      {step === 4 && !isD2 && entityConfig && (
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
