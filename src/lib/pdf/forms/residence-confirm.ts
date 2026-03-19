import type { Case } from '@/types/case';
import type { FormDefinition, FieldGroup } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';
import { getManualValue } from '../field-utils';
import { nationality, alienRegField, nameField, currentDateSplit } from '../field-presets';

// ── Text field mappings (24) ──

const textFieldMappings: TextFieldMapping[] = [
  // 외국인 정보
  nationality('t1'),
  alienRegField('t2'),
  nameField('t3'),
  { field: 't4', source: { type: 'manual', fieldId: 'applicant_phone_kr' } },
  { field: 't5', source: { type: 'static', value: '' } },

  // 숙소 제공자
  { field: 't6', source: { type: 'manual', fieldId: 'landlord_nationality' } },
  { field: 't7', source: { type: 'static', value: '' } },
  { field: 't8', source: { type: 'manual', fieldId: 'landlord_name' } },
  { field: 't9', source: { type: 'manual', fieldId: 'landlord_phone' } },
  { field: 't10', source: { type: 'static', value: '' } },
  { field: 't11', source: { type: 'static', value: '' } },
  { field: 't12', source: { type: 'static', value: '' } },
  { field: 't13', source: { type: 'static', value: '' } },
  { field: 't14', source: { type: 'static', value: '' } },
  { field: 't15', source: { type: 'static', value: '' } },

  // 제공일
  {
    field: 't16',
    source: { type: 'manual', fieldId: 'residence_start_date' },
    transform: 'date-yyyy',
  },
  {
    field: 't17',
    source: { type: 'manual', fieldId: 'residence_start_date' },
    transform: 'date-mm',
  },
  {
    field: 't18',
    source: { type: 'manual', fieldId: 'residence_start_date' },
    transform: 'date-dd',
  },

  // 확인일/서명
  ...currentDateSplit('t19', 't20', 't21'),
  { field: 't22', source: { type: 'manual', fieldId: 'landlord_name' } },
  { field: 't23', source: { type: 'ocr', docType: 'business_reg', key: '상호' } },
  { field: 't24', source: { type: 'static', value: '' } },
];

// ── Checkbox mappings (10) ──

const checkboxMappings: CheckboxMapping[] = [
  { field: 'c1', condition: (c) => getManualValue(c, 'landlord_relation') === '친족' },
  { field: 'c2', condition: (c) => getManualValue(c, 'landlord_relation') === '고용주' },
  { field: 'c3', condition: (c) => getManualValue(c, 'landlord_relation') === '기타' },
  { field: 'c4', condition: (c) => getManualValue(c, 'ownership_type') === '자가' },
  { field: 'c5', condition: (c) => getManualValue(c, 'ownership_type') === '임대' },
  { field: 'c6', condition: (c) => getManualValue(c, 'ownership_type') === '기타' },
  { field: 'c7', condition: (c) => getManualValue(c, 'residence_type') === '개인주택 등' },
  { field: 'c8', condition: (c) => getManualValue(c, 'residence_type') === '기숙사' },
  { field: 'c9', condition: (c) => getManualValue(c, 'residence_type') === '숙박시설' },
  { field: 'c10', condition: (c) => getManualValue(c, 'residence_type') === '기타' },
];

// ── Labels ──

const fieldLabels: Record<string, string> = {
  t1: '국적',
  t2: '외국인등록번호',
  t3: '성명',
  t4: '연락처',
  t5: '주소',
  t6: '제공자 국적',
  t7: '제공자 등록번호',
  t8: '제공자 성명',
  t9: '제공자 연락처',
  t10: '기타 (관계)',
  t11: '기타 (소유)',
  t12: '기타 (소유2)',
  t13: '기타 (주거)',
  t14: '기타 (주거2)',
  t15: '기타 (주거3)',
  t16: '제공일 (년)',
  t17: '제공일 (월)',
  t18: '제공일 (일)',
  t19: '확인일 (년)',
  t20: '확인일 (월)',
  t21: '확인일 (일)',
  t22: '성명 (서명)',
  t23: '업체명',
  t24: '출입국·외국인청',
};

const checkboxLabels: Record<string, string> = {
  c1: '가족 및 친척',
  c2: '고용주',
  c3: '기타 (관계)',
  c4: '자가',
  c5: '임대',
  c6: '기타 (소유)',
  c7: '개인주택 등',
  c8: '기숙사',
  c9: '숙박시설',
  c10: '기타 (주거)',
};

// ── Field groups ──

const fieldGroups: FieldGroup[] = [
  {
    id: 'foreigner',
    label: '외국인 정보',
    fields: ['t1', 't2', 't3', 't4', 't5'],
    cols: '1fr 1fr',
  },
  {
    id: 'provider',
    label: '숙소 제공자',
    fields: ['t6', 't7', 't8', 't9'],
    cols: '1fr 1fr',
  },
  {
    id: 'details',
    label: '제공 상세',
    fields: ['t10', 't11', 't12', 't13', 't14', 't15'],
    cols: '1fr 1fr 1fr',
  },
  {
    id: 'dates',
    label: '제공일 / 확인일',
    fields: ['t16', 't17', 't18', 't19', 't20', 't21'],
    cols: '1fr 1fr 1fr',
  },
  {
    id: 'signature',
    label: '서명',
    fields: ['t22', 't23', 't24'],
    cols: '1fr 1fr',
  },
];

// ── FormDefinition ──

export const residenceConfirmForm: FormDefinition = {
  id: 'residence_confirmation',
  label: '거주숙소 제공확인서',
  templatePath: '/forms/residence_confirmation.pdf',
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
  applicableVisas: ['E-7'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `거주숙소_제공확인서_${name}.pdf`;
  },
};
