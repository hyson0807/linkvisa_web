import type { Case } from '@/types/case';
import type { FormDefinition, FieldGroup } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';
import { ocrFallback, getOcrValue } from '../field-utils';

// ── Text field mappings (22) ──

const textFieldMappings: TextFieldMapping[] = [
  // 외국인력 정보
  {
    field: 't1',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '국적'], ['alien_registration', '국적']) },
  },
  {
    field: 't2',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
  },
  {
    field: 't3',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
  },
  {
    field: 't4',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']) },
  },
  { field: 't5', source: { type: 'ocr', docType: 'passport', key: '여권번호' } },
  { field: 't6', source: { type: 'static', value: '' } },
  {
    field: 't7',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['degree_cert', '학교명'], ['graduation_cert', '학교명']) },
  },
  {
    field: 't8',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['degree_cert', '전공'], ['graduation_cert', '전공']) },
  },
  { field: 't9', source: { type: 'manual', fieldId: 'career1_company' } },
  {
    field: 't10',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['employment_contract', '근무내용'], ['employment_contract', '직위']) },
  },

  // 고용(예정)사업장
  { field: 't11', source: { type: 'ocr', docType: 'business_reg', key: '상호' } },
  { field: 't12', source: { type: 'ocr', docType: 'business_reg', key: '사업장소재지' } },
  { field: 't13', source: { type: 'ocr', docType: 'business_reg', key: '대표자' } },
  { field: 't14', source: { type: 'static', value: '' } },
  { field: 't15', source: { type: 'ocr', docType: 'business_reg', key: '사업자등록번호' } },
  {
    field: 't16',
    source: {
      type: 'computed',
      fn: (c) => {
        const 업태 = getOcrValue(c, 'business_reg', '업태');
        const 종목 = getOcrValue(c, 'business_reg', '종목');
        return [업태, 종목].filter(Boolean).join(' ');
      },
    },
  },
  { field: 't17', source: { type: 'static', value: '' } },

  // 날짜/추천자
  {
    field: 't18',
    source: { type: 'computed', fn: () => String(new Date().getFullYear()) },
  },
  {
    field: 't19',
    source: { type: 'computed', fn: () => String(new Date().getMonth() + 1).padStart(2, '0') },
  },
  {
    field: 't20',
    source: { type: 'computed', fn: () => String(new Date().getDate()).padStart(2, '0') },
  },
  { field: 't21', source: { type: 'static', value: '' } },
  { field: 't22', source: { type: 'static', value: '' } },
];

// ── Checkbox mappings (none) ──

const checkboxMappings: CheckboxMapping[] = [];

// ── Labels ──

const fieldLabels: Record<string, string> = {
  t1: '국적',
  t2: '성명',
  t3: '생년월일',
  t4: '성별',
  t5: '여권번호',
  t6: '추천번호',
  t7: '졸업 대학교명',
  t8: '전공',
  t9: '경력',
  t10: '근무 직종',
  t11: '사업장명',
  t12: '소재지',
  t13: '대표자',
  t14: '전화번호',
  t15: '사업자등록번호',
  t16: '업종 및 분야',
  t17: '비고',
  t18: '년',
  t19: '월',
  t20: '일',
  t21: '추천자',
  t22: '부',
};

const checkboxLabels: Record<string, string> = {};

// ── Field groups ──

const fieldGroups: FieldGroup[] = [
  {
    id: 'foreigner_info',
    label: '외국인력 정보',
    fields: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10'],
    cols: '1fr 1fr',
  },
  {
    id: 'company_info',
    label: '고용(예정)사업장',
    fields: ['t11', 't12', 't13', 't14', 't15', 't16', 't17'],
    cols: '1fr 1fr',
  },
  {
    id: 'date_rec',
    label: '날짜 / 추천자',
    fields: ['t18', 't19', 't20', 't21', 't22'],
    cols: '1fr 1fr 1fr',
  },
];

// ── FormDefinition ──

export const professionalRecForm: FormDefinition = {
  id: 'professional_recommendation',
  label: '전문인력 고용추천서',
  templatePath: '/forms/professional_recommendation.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldPageHints: Object.fromEntries(
    textFieldMappings.map(({ field }) => [field, 0] as const),
  ),
  mustFlatten: true,
  fieldLabels,
  checkboxLabels,
  fieldGroups,
  applicableVisas: ['E-7'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `전문인력_고용추천서_${name}.pdf`;
  },
};
