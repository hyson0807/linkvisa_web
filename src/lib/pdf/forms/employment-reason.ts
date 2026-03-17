import type { Case } from '@/types/case';
import type { FormDefinition } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';

// 고용사유서는 ai-generate 방식이지만, PDF 폼 매핑도 지원
// TODO: PDF 템플릿 준비 후 실제 필드명으로 매핑 작성
const textFieldMappings: TextFieldMapping[] = [];
const checkboxMappings: CheckboxMapping[] = [];
const fieldLabels: Record<string, string> = {};
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
