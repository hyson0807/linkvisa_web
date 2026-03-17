import type { Case } from '@/types/case';
import type { FormDefinition } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';
import { ocrFallback } from '../field-utils';

const checkboxMappings: CheckboxMapping[] = [];

const textFieldMappings: TextFieldMapping[] = [
  // ── Section 1: 고용기업 사항 (t1~t11) ──
  { field: 't1', source: { type: 'ocr', docType: 'business_reg', key: '상호' } },
  { field: 't2', source: { type: 'ocr', docType: 'business_reg', key: '사업자등록번호' } },
  { field: 't3', source: { type: 'ocr', docType: 'business_reg', key: '대표자' } },
  { field: 't4', source: { type: 'ocr', docType: 'business_reg', key: '사업장소재지' } },
  { field: 't5', source: { type: 'manual', fieldId: 'company_capital' } },
  { field: 't6', source: { type: 'manual', fieldId: 'company_revenue' } },
  { field: 't7', source: { type: 'manual', fieldId: 'company_debt' } },
  { field: 't8', source: { type: 'manual', fieldId: 'company_profit' } },
  { field: 't9', source: { type: 'manual', fieldId: 'employee_count' } },
  { field: 't10', source: { type: 'manual', fieldId: 'foreign_expert_count' } },
  { field: 't11', source: { type: 'manual', fieldId: 'company_description' } },

  // ── Section 2: 전문외국인력 이력개요 (t12~t36) ──
  {
    field: 't12',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
  },
  {
    field: 't13',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']) },
  },
  {
    field: 't14',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '국적'], ['alien_registration', '국적']) },
  },
  {
    field: 't15',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
  },
  { field: 't16', source: { type: 'ocr', docType: 'passport', key: '여권번호' } },
  { field: 't17', source: { type: 'static', value: '' } },
  { field: 't18', source: { type: 'manual', fieldId: 'applicant_phone_kr' } },
  {
    field: 't19',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['degree_cert', '학교명']) },
  },
  { field: 't20', source: { type: 'ocr', docType: 'degree_cert', key: '학위' } },
  { field: 't21', source: { type: 'ocr', docType: 'degree_cert', key: '전공' } },
  {
    field: 't22',
    source: { type: 'ocr', docType: 'degree_cert', key: '졸업일자' },
    transform: 'date-yyyy',
  },
  { field: 't23', source: { type: 'manual', fieldId: 'career1_company' } },
  { field: 't24', source: { type: 'manual', fieldId: 'career1_period' } },
  { field: 't25', source: { type: 'manual', fieldId: 'career1_field' } },
  { field: 't26', source: { type: 'manual', fieldId: 'career1_position' } },
  { field: 't27', source: { type: 'manual', fieldId: 'career2_company' } },
  { field: 't28', source: { type: 'manual', fieldId: 'career2_period' } },
  { field: 't29', source: { type: 'manual', fieldId: 'career2_field' } },
  { field: 't30', source: { type: 'manual', fieldId: 'career2_position' } },
  { field: 't31', source: { type: 'ocr', docType: 'employment_contract', key: '계약기간' } },
  { field: 't32', source: { type: 'case', key: 'visaType' } },
  { field: 't33', source: { type: 'ocr', docType: 'employment_contract', key: '근무내용' } },
  { field: 't34', source: { type: 'ocr', docType: 'employment_contract', key: '직위' } },
  {
    field: 't35',
    source: {
      type: 'computed',
      fn: (c) => ocrFallback(c, ['employment_contract', '근무지'], ['business_reg', '사업장소재지']),
    },
  },
  { field: 't36', source: { type: 'ocr', docType: 'employment_contract', key: '급여' } },

  // ── Section 3: 고용사유 및 인력활용계획 (t37~t40) ──
  { field: 't37', source: { type: 'manual', fieldId: 'er_reason' } },
  { field: 't38', source: { type: 'manual', fieldId: 'er_tech_effect' } },
  { field: 't39', source: { type: 'manual', fieldId: 'er_utilization_plan' } },
  { field: 't40', source: { type: 'manual', fieldId: 'er_other' } },
];

const fieldLabels: Record<string, string> = {
  t1: '회사명',
  t2: '사업자등록번호',
  t3: '대표자명',
  t4: '회사주소',
  t5: '자본금',
  t6: '총매출액',
  t7: '부채총액',
  t8: '영업이익',
  t9: '상시종업원수',
  t10: '외국전문인력수',
  t11: '회사 및 사업소개',
  t12: '성명(영문)',
  t13: '성별',
  t14: '국적',
  t15: '생년월일',
  t16: '여권번호',
  t17: '(현지)주소',
  t18: '전화번호',
  t19: '학교명',
  t20: '학위',
  t21: '전공',
  t22: '졸업년도',
  t23: '경력1-업체명',
  t24: '경력1-재직기간',
  t25: '경력1-근무분야',
  t26: '경력1-직위',
  t27: '경력2-업체명',
  t28: '경력2-재직기간',
  t29: '경력2-근무분야',
  t30: '경력2-직위',
  t31: '고용(예정)기간',
  t32: '체류자격(직종코드)',
  t33: '근무(예정)분야',
  t34: '직위',
  t35: '근무(예정)지',
  t36: '급여 및 처우',
  t37: '고용사유',
  t38: '기술도입 및 고용효과',
  t39: '활용계획',
  t40: '기타사항',
};

const checkboxLabels: Record<string, string> = {};

export const employmentReasonForm: FormDefinition = {
  id: 'employment_reason',
  label: '고용사유서',
  templatePath: '/forms/employment_reason.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldLabels,
  checkboxLabels,
  applicableVisas: ['E-7'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `고용사유서_${name}.pdf`;
  },
};
