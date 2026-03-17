'use client';

import { getDocumentsForVisa } from '@/lib/document-registry';
import type { Case } from '@/types/case';

interface FormConfirmStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

const FORM_DESCRIPTIONS: Record<string, string> = {
  unified_application: '출입국관리법 별지 제34호서식 — 개인정보, 체류자격, 근무처 정보 등',
  occupation_report: '외국인의 직업, 근무처 정보를 신고하는 서식',
  status_change_app: '체류자격 변경 시 필요한 신청서',
  stay_extension_app: '체류기간 연장 시 필요한 신청서',
  visa_issuance_app: '사증발급인정서 신청에 필요한 서식',
  spouse_invitation: '외국인 배우자 초청 시 작성하는 초청장',
  identity_guarantee: '신원보증인이 작성하는 보증서',
  local_linked_app: '지자체 추천 연계 신청서',
  employment_reason: '업로드된 서류를 기반으로 AI가 고용사유서를 자동 생성',
  marriage_background: 'AI가 결혼배경진술서를 자동 생성',
  stay_purpose_statement: 'AI가 체류목적 설명서를 자동 생성',
  invitation_reason: 'AI가 초청 사유서를 자동 생성',
  job_description: 'AI가 직무기술서를 자동 생성',
};

const SOURCE_BADGE: Record<string, { label: string; className: string }> = {
  'form-generate': {
    label: '양식 자동입력',
    className: 'bg-blue-50 text-blue-700',
  },
  'ai-generate': {
    label: 'AI 자동생성',
    className: 'bg-purple-50 text-purple-700',
  },
};

export default function FormConfirmStep({ caseData, onNext, onPrev }: FormConfirmStepProps) {
  const allDocs = getDocumentsForVisa(caseData.visaType);
  const formDocs = allDocs.filter(
    (d) => d.source === 'form-generate' || d.source === 'ai-generate',
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">자동 작성할 양식 확인</h2>
        <p className="mt-1 text-sm text-gray-500">
          업로드하신 서류를 바탕으로 아래 양식들을 자동으로 작성합니다. 확인 후 다음 단계로 진행해 주세요.
        </p>
      </div>

      {/* Form cards */}
      <div className="space-y-3">
        {formDocs.map((doc) => {
          const badge = SOURCE_BADGE[doc.source];
          return (
            <div
              key={doc.id}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{doc.label}</span>
                {badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )}
              </div>
              {FORM_DESCRIPTIONS[doc.id] && (
                <p className="mt-1 text-[13px] text-gray-500">
                  {FORM_DESCRIPTIONS[doc.id]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 서류 업로드
        </button>

        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          다음 단계로 →
        </button>
      </div>
    </div>
  );
}
