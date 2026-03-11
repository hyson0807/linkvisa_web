import type { ManualFieldDef } from '@/types/case';

export const manualFieldRegistry: ManualFieldDef[] = [
  // ── 통합신청서 관련 ──
  {
    id: 'applicant_phone_kr',
    label: '연락처 (한국)',
    section: 'unified_app',
    fieldType: 'text',
    required: true,
    requiredForVisas: [],
    placeholder: '예: 010-1234-5678',
    halfWidth: true,
  },
  {
    id: 'entry_date',
    label: '입국 예정일',
    section: 'unified_app',
    fieldType: 'date',
    required: true,
    requiredForVisas: [],
    halfWidth: true,
  },
  {
    id: 'stay_duration',
    label: '체류 예정 기간',
    section: 'unified_app',
    fieldType: 'text',
    required: true,
    requiredForVisas: [],
    placeholder: '예: 1년, 6개월',
    halfWidth: true,
  },
  {
    id: 'annual_income',
    label: '연 소득금액 (만원)',
    section: 'unified_app',
    fieldType: 'text',
    required: false,
    requiredForVisas: [],
    placeholder: '예: 3600',
    halfWidth: true,
  },
  {
    id: 'refund_bank_account',
    label: '환불용 계좌번호',
    section: 'unified_app',
    fieldType: 'text',
    required: false,
    requiredForVisas: [],
    placeholder: '예: 국민은행 123-456-789012',
  },
  {
    id: 'cost_bearer',
    label: '체류비용 부담자',
    section: 'unified_app',
    fieldType: 'select',
    options: [
      { value: '본인', label: '본인' },
      { value: '초청인', label: '초청인(고용주)' },
      { value: '기타', label: '기타' },
    ],
    defaultValue: '초청인',
    required: false,
    requiredForVisas: [],
    halfWidth: true,
  },

  // ── 고용사유서 관련 ──
  {
    id: 'company_capital',
    label: '자본금 (백만원)',
    section: 'employment_reason',
    fieldType: 'text',
    required: true,
    requiredForVisas: ['E-7'],
    placeholder: '예: 500',
    halfWidth: true,
  },
  {
    id: 'company_revenue',
    label: '총매출액 (백만원)',
    section: 'employment_reason',
    fieldType: 'text',
    required: true,
    requiredForVisas: ['E-7'],
    placeholder: '예: 2000',
    halfWidth: true,
  },
  {
    id: 'company_debt',
    label: '부채총액 (백만원)',
    section: 'employment_reason',
    fieldType: 'text',
    required: false,
    requiredForVisas: ['E-7'],
    placeholder: '예: 300',
    halfWidth: true,
  },
  {
    id: 'company_profit',
    label: '영업이익 (백만원)',
    section: 'employment_reason',
    fieldType: 'text',
    required: false,
    requiredForVisas: ['E-7'],
    placeholder: '예: 150',
    halfWidth: true,
  },
  {
    id: 'employee_count',
    label: '상시종업원수',
    section: 'employment_reason',
    fieldType: 'text',
    required: true,
    requiredForVisas: ['E-7'],
    placeholder: '예: 45',
    halfWidth: true,
  },
  {
    id: 'foreign_expert_count',
    label: '현재 외국전문인력수',
    section: 'employment_reason',
    fieldType: 'text',
    required: true,
    requiredForVisas: ['E-7'],
    placeholder: '예: 3',
    halfWidth: true,
  },

  // ── 신원보증서 관련 ──
  {
    id: 'guarantor_name',
    label: '신원보증인 성명',
    section: 'guarantor',
    fieldType: 'text',
    required: true,
    requiredForVisas: ['E-7'],
    placeholder: '예: 김철수',
    halfWidth: true,
  },
  {
    id: 'guarantor_relation',
    label: '피보증인과의 관계',
    section: 'guarantor',
    fieldType: 'select',
    options: [
      { value: '고용주', label: '고용주' },
      { value: '친족', label: '친족' },
      { value: '지인', label: '지인' },
      { value: '기타', label: '기타' },
    ],
    required: true,
    requiredForVisas: ['E-7'],
    halfWidth: true,
  },
  {
    id: 'guarantor_position',
    label: '보증인 직위',
    section: 'guarantor',
    fieldType: 'text',
    required: true,
    requiredForVisas: ['E-7'],
    placeholder: '예: 대표이사',
    halfWidth: true,
  },
  {
    id: 'guarantor_phone',
    label: '보증인 연락처',
    section: 'guarantor',
    fieldType: 'text',
    required: false,
    requiredForVisas: ['E-7'],
    placeholder: '예: 02-1234-5678',
    halfWidth: true,
  },

  // ── 거주숙소 확인서 관련 ──
  {
    id: 'landlord_name',
    label: '숙소 제공자 성명',
    section: 'residence',
    fieldType: 'text',
    required: true,
    requiredForVisas: ['E-7'],
    placeholder: '예: 박영희 / (주)테크솔루션',
    halfWidth: true,
  },
  {
    id: 'landlord_nationality',
    label: '숙소 제공자 국적',
    section: 'residence',
    fieldType: 'text',
    required: false,
    requiredForVisas: ['E-7'],
    placeholder: '예: 대한민국',
    halfWidth: true,
  },
  {
    id: 'landlord_relation',
    label: '외국인과의 관계',
    section: 'residence',
    fieldType: 'select',
    options: [
      { value: '친족', label: '친족' },
      { value: '고용주', label: '고용주' },
      { value: '기타', label: '기타' },
    ],
    required: true,
    requiredForVisas: ['E-7'],
    halfWidth: true,
  },
  {
    id: 'ownership_type',
    label: '소유형태',
    section: 'residence',
    fieldType: 'select',
    options: [
      { value: '자가', label: '자가' },
      { value: '임대', label: '임대' },
      { value: '기타', label: '기타' },
    ],
    required: true,
    requiredForVisas: ['E-7'],
    halfWidth: true,
  },
  {
    id: 'residence_type',
    label: '주거형태',
    section: 'residence',
    fieldType: 'select',
    options: [
      { value: '개인주택 등', label: '개인주택 등' },
      { value: '기숙사', label: '기숙사' },
      { value: '숙박시설', label: '숙박시설' },
      { value: '기타', label: '기타' },
    ],
    required: true,
    requiredForVisas: ['E-7'],
    halfWidth: true,
  },
  {
    id: 'residence_start_date',
    label: '숙소 제공 시작일',
    section: 'residence',
    fieldType: 'date',
    required: false,
    requiredForVisas: ['E-7'],
    halfWidth: true,
  },

  // ── 기타 ──
  {
    id: 'criminal_record',
    label: '범죄경력',
    section: 'other',
    fieldType: 'radio',
    options: [
      { value: '예', label: '예' },
      { value: '아니오', label: '아니오' },
    ],
    defaultValue: '아니오',
    required: false,
    requiredForVisas: [],
    halfWidth: true,
  },
  {
    id: 'deportation_history',
    label: '강제퇴거/출국명령 이력',
    section: 'other',
    fieldType: 'radio',
    options: [
      { value: '예', label: '예' },
      { value: '아니오', label: '아니오' },
    ],
    defaultValue: '아니오',
    required: false,
    requiredForVisas: [],
    halfWidth: true,
  },
  {
    id: 'previous_visit',
    label: '이전 한국 방문 이력',
    section: 'other',
    fieldType: 'radio',
    options: [
      { value: '예', label: '예' },
      { value: '아니오', label: '아니오' },
    ],
    defaultValue: '아니오',
    required: false,
    requiredForVisas: [],
    halfWidth: true,
  },
  {
    id: 'stay_experience',
    label: '한국 내 체류 경험',
    section: 'other',
    fieldType: 'radio',
    options: [
      { value: '예', label: '예' },
      { value: '아니오', label: '아니오' },
    ],
    defaultValue: '아니오',
    required: false,
    requiredForVisas: [],
    halfWidth: true,
  },
];

export const sectionMeta: Record<
  ManualFieldDef['section'],
  { label: string; defaultOpen: boolean; visaFilter?: string[]; badge?: string }
> = {
  unified_app: {
    label: '통합신청서',
    defaultOpen: true,
  },
  employment_reason: {
    label: '고용사유서 수치 정보',
    defaultOpen: true,
    visaFilter: ['E-7'],
    badge: '서술 항목은 AI가 자동 작성',
  },
  guarantor: {
    label: '신원보증서',
    defaultOpen: true,
    visaFilter: ['E-7'],
  },
  residence: {
    label: '거주숙소 확인서',
    defaultOpen: true,
    visaFilter: ['E-7'],
  },
  other: {
    label: '기타',
    defaultOpen: false,
    badge: '기본값 자동 설정됨',
  },
};

export const sectionOrder: ManualFieldDef['section'][] = [
  'unified_app',
  'employment_reason',
  'guarantor',
  'residence',
  'other',
];

export function getFieldsForVisa(visaType: string): ManualFieldDef[] {
  return manualFieldRegistry.filter(
    (f) => f.requiredForVisas.length === 0 || f.requiredForVisas.includes(visaType)
  );
}

export function getDefaultValues(visaType: string): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const field of getFieldsForVisa(visaType)) {
    if (field.defaultValue) {
      defaults[field.id] = field.defaultValue;
    }
  }
  return defaults;
}
