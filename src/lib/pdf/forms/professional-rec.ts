import type { Case } from '@/types/case';
import type { FormDefinition } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';

// TODO: PDF 템플릿 준비 후 실제 필드명으로 매핑 작성
const textFieldMappings: TextFieldMapping[] = [];
const checkboxMappings: CheckboxMapping[] = [];
const fieldLabels: Record<string, string> = {};
const checkboxLabels: Record<string, string> = {};

export const professionalRecForm: FormDefinition = {
  id: 'professional_recommendation',
  label: '전문인력 고용추천서',
  templatePath: '/forms/professional_recommendation.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldLabels,
  checkboxLabels,
  applicableVisas: ['E-7'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `전문인력_고용추천서_${name}.pdf`;
  },
};
