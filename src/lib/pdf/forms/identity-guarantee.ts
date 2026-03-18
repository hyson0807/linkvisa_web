import type { Case } from '@/types/case';
import type { FormDefinition, FieldGroup } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';
import { ocrFallback } from '../field-utils';

// ── Helpers ──

function getSex(c: Case): string {
  return ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']).toUpperCase();
}

// ── Text field mappings (24) ──

const textFieldMappings: TextFieldMapping[] = [
  // 피보증 외국인
  {
    field: 't1',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-surname',
  },
  {
    field: 't2',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-given',
  },
  { field: 't3', source: { type: 'static', value: '' } },
  {
    field: 't4',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
  },
  {
    field: 't5',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '국적'], ['alien_registration', '국적']) },
  },
  { field: 't6', source: { type: 'ocr', docType: 'passport', key: '여권번호' } },
  { field: 't7', source: { type: 'static', value: '' } },
  { field: 't8', source: { type: 'manual', fieldId: 'applicant_phone_kr' } },
  { field: 't9', source: { type: 'case', key: 'visaType' } },

  // 신원보증인
  { field: 't10', source: { type: 'manual', fieldId: 'guarantor_name' } },
  { field: 't11', source: { type: 'static', value: '' } },
  { field: 't12', source: { type: 'static', value: '대한민국' } },
  { field: 't13', source: { type: 'static', value: '' } },
  { field: 't14', source: { type: 'manual', fieldId: 'guarantor_phone' } },
  { field: 't15', source: { type: 'ocr', docType: 'business_reg', key: '사업장소재지' } },
  { field: 't16', source: { type: 'manual', fieldId: 'guarantor_relation' } },
  { field: 't17', source: { type: 'ocr', docType: 'business_reg', key: '상호' } },
  { field: 't18', source: { type: 'ocr', docType: 'business_reg', key: '사업장소재지' } },
  { field: 't19', source: { type: 'manual', fieldId: 'guarantor_position' } },
  { field: 't20', source: { type: 'static', value: '' } },

  // 날짜/서명
  {
    field: 't21',
    source: { type: 'computed', fn: () => String(new Date().getFullYear()) },
  },
  {
    field: 't22',
    source: { type: 'computed', fn: () => String(new Date().getMonth() + 1).padStart(2, '0') },
  },
  {
    field: 't23',
    source: { type: 'computed', fn: () => String(new Date().getDate()).padStart(2, '0') },
  },
  { field: 't24', source: { type: 'manual', fieldId: 'guarantor_name' } },
];

// ── Checkbox mappings (4) ──

const checkboxMappings: CheckboxMapping[] = [
  { field: 'c1', condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '남' || v === 'M'; } },
  { field: 'c2', condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '여' || v === 'F'; } },
  { field: 'c3', condition: (c) => c.manualFields?.guarantor_sex === '남' },
  { field: 'c4', condition: (c) => c.manualFields?.guarantor_sex === '여' },
];

// ── Labels ──

const fieldLabels: Record<string, string> = {
  t1: '성 (Surname)',
  t2: '명 (Given name)',
  t3: '한자성명',
  t4: '생년월일',
  t5: '국적',
  t6: '여권번호',
  t7: '대한민국 내 주소',
  t8: '전화번호',
  t9: '체류목적',
  t10: '보증인 성명',
  t11: '보증인 한자성명',
  t12: '보증인 국적',
  t13: '보증인 여권/생년월일',
  t14: '보증인 전화번호',
  t15: '보증인 주소',
  t16: '보증인 관계',
  t17: '보증인 근무처',
  t18: '근무처 주소',
  t19: '보증인 직위',
  t20: '비고',
  t21: '년',
  t22: '월',
  t23: '일',
  t24: '보증인 성명 (서명)',
};

const checkboxLabels: Record<string, string> = {
  c1: '남 (외국인)',
  c2: '여 (외국인)',
  c3: '남 (보증인)',
  c4: '여 (보증인)',
};

// ── Field groups ──

const fieldGroups: FieldGroup[] = [
  {
    id: 'foreigner',
    label: '피보증 외국인',
    fields: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'],
    cols: '1fr 1fr',
  },
  {
    id: 'guarantor',
    label: '신원보증인',
    fields: ['t10', 't11', 't12', 't13', 't14', 't15', 't16', 't17', 't18', 't19', 't20'],
    cols: '1fr 1fr',
  },
  {
    id: 'period_date',
    label: '날짜 / 서명',
    fields: ['t21', 't22', 't23', 't24'],
    cols: '1fr 1fr 1fr 1fr',
  },
];

// ── FormDefinition ──

export const identityGuaranteeForm: FormDefinition = {
  id: 'identity_guarantee',
  label: '신원보증서',
  templatePath: '/forms/identity_guarantee.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldPageHints: Object.fromEntries([
    ...textFieldMappings.map(({ field }) => [field, 0] as const),
    ...checkboxMappings.map(({ field }) => [field, 0] as const),
  ]),
  mustFlatten: true,
  fieldLabels,
  checkboxLabels,
  fieldGroups,
  applicableVisas: ['E-7', 'F-6'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `신원보증서_${name}.pdf`;
  },
};
