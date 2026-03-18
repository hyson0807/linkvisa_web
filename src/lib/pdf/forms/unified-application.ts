import type { Case } from '@/types/case';
import type { FormDefinition } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';
import { ocrFallback, getOcrValue } from '../field-utils';

// ── Helpers ──

function getSex(c: Case): string {
  return ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']).toUpperCase();
}

// ── Checkbox mappings ──

const checkboxMappings: CheckboxMapping[] = [
  { field: 'c1', condition: (c) => c.applicationType === '외국인등록' },
  { field: 'c2', condition: (c) => c.applicationType === '등록증재발급' },
  { field: 'c3', condition: (c) => c.applicationType === '체류기간연장허가' },
  { field: 'c4', condition: (c) => c.applicationType === '체류자격변경허가' },
  { field: 'c5', condition: (c) => c.applicationType === '체류자격부여' },
  { field: 'c6', condition: () => false },
  { field: 'c7', condition: (c) => c.applicationType === '근무처변경추가' },
  { field: 'c8', condition: () => false },
  { field: 'c9', condition: (c) => c.applicationType === '체류지변경신고' },
  { field: 'c10', condition: (c) => c.applicationType === '등록사항변경신고' },
  { field: 'c11', condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '남' || v === 'M'; } },
  { field: 'c12', condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '여' || v === 'F'; } },
  // School status (재학 여부)
  { field: 'c13', condition: (c) => c.manualFields?.school_status === '미취학' },
  { field: 'c14', condition: (c) => c.manualFields?.school_status === '초' },
  { field: 'c15', condition: (c) => c.manualFields?.school_status === '중' },
  { field: 'c16', condition: (c) => c.manualFields?.school_status === '고' },
  // School type (학교 종류)
  { field: 'c17', condition: (c) => c.manualFields?.school_type === '교육청 인가' },
  { field: 'c18', condition: (c) => c.manualFields?.school_type === '교육청 비인가' },
  { field: 'c19', condition: (c) => c.manualFields?.school_type === '대안학교' },
];

// ── Text field mappings ──

const textFieldMappings: TextFieldMapping[] = [
  // Application type visa code fields
  {
    field: 't1',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격변경허가' ? c.visaType : '' },
  },
  {
    field: 't2',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격변경허가' ? c.visaType : '' },
  },
  {
    field: 't3',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격부여' ? c.visaType : '' },
  },
  {
    field: 't4',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격부여' ? c.visaType : '' },
  },

  // 체류자격 외 활동허가 희망 자격
  {
    field: 't5',
    source: { type: 'static', value: '' },
  },
  {
    field: 't6',
    source: { type: 'static', value: '' },
  },

  // Name (passport → alien_registration fallback)
  {
    field: 't7',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-surname',
  },
  {
    field: 't8',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-given',
  },

  // Date of birth (passport → alien_registration fallback)
  {
    field: 't9',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-yyyy',
  },
  {
    field: 't10',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-mm',
  },
  {
    field: 't11',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-dd',
  },

  // Foreign Resident Registration No. (t12-t24, 13 digits)
  ...Array.from({ length: 13 }, (_, i) => ({
    field: `t${12 + i}`,
    source: { type: 'ocr' as const, docType: 'alien_registration', key: '외국인등록번호' },
    transform: 'alien-reg-digit' as const,
    digitIndex: i,
  })),

  // Nationality (passport → alien_registration fallback)
  {
    field: 't25',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '국적'], ['alien_registration', '국적']) },
  },

  // Passport
  {
    field: 't26',
    source: { type: 'ocr', docType: 'passport', key: '여권번호' },
  },
  {
    field: 't27',
    source: { type: 'ocr', docType: 'passport', key: '여권발급일' },
  },
  {
    field: 't28',
    source: { type: 'ocr', docType: 'passport', key: '여권만료일' },
  },

  // Address in Korea
  {
    field: 't29',
    source: { type: 'static', value: '' },
  },

  // Phone numbers
  {
    field: 't30',
    source: { type: 'manual', fieldId: 'applicant_phone_kr' },
  },
  {
    field: 't31',
    source: { type: 'manual', fieldId: 'applicant_phone_kr' },
  },

  // Home country address & phone
  { field: 't32', source: { type: 'static', value: '' } },
  { field: 't33', source: { type: 'static', value: '' } },

  // School
  { field: 't34', source: { type: 'computed', fn: (c) => ocrFallback(c, ['degree_cert', '학교명'], ['graduation_cert', '학교명']) } },
  { field: 't35', source: { type: 'static', value: '' } },

  // Workplace - current
  {
    field: 't36',
    source: { type: 'ocr', docType: 'business_reg', key: '상호' },
  },
  {
    field: 't37',
    source: { type: 'ocr', docType: 'business_reg', key: '사업자등록번호' },
  },
  // Current workplace phone
  { field: 't38', source: { type: 'static', value: '' } },

  // Workplace - new (for 근무처변경 cases, use same company)
  {
    field: 't39',
    source: { type: 'computed', fn: (c) =>
      c.applicationType === '근무처변경추가' ? '' : getOcrValue(c, 'business_reg', '상호')
    },
  },
  {
    field: 't40',
    source: { type: 'computed', fn: (c) =>
      c.applicationType === '근무처변경추가' ? '' : getOcrValue(c, 'business_reg', '사업자등록번호')
    },
  },

  // New workplace phone
  { field: 't41', source: { type: 'static', value: '' } },

  // Annual income
  {
    field: 't42',
    source: { type: 'manual', fieldId: 'annual_income' },
  },

  // Occupation
  {
    field: 't43',
    source: { type: 'computed', fn: (c) =>
      ocrFallback(c, ['employment_contract', '근무내용'], ['employment_contract', '직위'])
    },
  },

  // Intended period of reentry
  { field: 't44', source: { type: 'static', value: '' } },

  // Email
  {
    field: 't45',
    source: { type: 'static', value: '' },
  },

  // Refund bank account
  {
    field: 't46',
    source: { type: 'manual', fieldId: 'refund_bank_account' },
  },

  // Date of application (today)
  {
    field: 't47',
    source: { type: 'computed', fn: () => {
      const d = new Date();
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }},
  },
];

// ── Field labels ──

const fieldLabels: Record<string, string> = {
  t1: '변경 희망자격 (코드)',
  t2: '변경 희망자격 (영문)',
  t3: '부여 희망자격 (코드)',
  t4: '부여 희망자격 (영문)',
  t5: '체류자격 외 활동허가 희망자격 (코드)',
  t6: '체류자격 외 활동허가 희망자격 (영문)',
  t7: '성 (Surname)',
  t8: '이름 (Given names)',
  t9: '생년 (yyyy)',
  t10: '월 (mm)',
  t11: '일 (dd)',
  t25: '국적',
  t26: '여권번호',
  t27: '여권발급일자',
  t28: '여권만료일',
  t29: '대한민국 내 주소',
  t30: '전화번호',
  t31: '휴대전화',
  t32: '본국 주소',
  t33: '본국 전화번호',
  t34: '학교 이름',
  t35: '학교 전화번호',
  t36: '원 근무처',
  t37: '사업자등록번호 (현)',
  t38: '원 근무처 전화번호',
  t39: '예정 근무처',
  t40: '사업자등록번호 (신)',
  t41: '예정 근무처 전화번호',
  t42: '연 소득금액',
  t43: '직업',
  t44: '재입국 신청 기간',
  t45: '이메일',
  t46: '반환용 계좌번호',
  t47: '신청일',
};

// Alien registration digit fields (t12-t24)
for (let i = 0; i < 13; i++) {
  fieldLabels[`t${12 + i}`] = `외국인등록번호 (${i + 1}번째 자리)`;
}

const checkboxLabels: Record<string, string> = {
  c1: '외국인등록',
  c2: '등록증재발급',
  c3: '체류기간연장허가',
  c4: '체류자격변경허가',
  c5: '체류자격부여',
  c6: '체류자격 외 활동허가',
  c7: '근무처변경추가',
  c8: '재입국허가',
  c9: '체류지변경신고',
  c10: '등록사항변경신고',
  c11: '남 (M)',
  c12: '여 (F)',
  c13: '미취학',
  c14: '초등학교',
  c15: '중학교',
  c16: '고등학교',
  c17: '교육청 인가',
  c18: '교육청 비인가',
  c19: '대안학교',
};

// ── FormDefinition ──

const ALL_VISAS = ['E-7', 'D-4', 'F-5', 'D-2', 'F-6', 'F-2', 'H-2', 'C-3'];

export const unifiedApplicationForm: FormDefinition = {
  id: 'unified_application',
  label: '통합신청서',
  templatePath: '/forms/application_form.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldPageHints: Object.fromEntries([
    ...textFieldMappings.map(({ field }) => [field, 0] as const),
    ...checkboxMappings.map(({ field }) => [field, 0] as const),
  ]),
  mustFlatten: true,
  fieldLabels,
  checkboxLabels,
  applicableVisas: ALL_VISAS,
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `통합신청서_${name}.pdf`;
  },
};
