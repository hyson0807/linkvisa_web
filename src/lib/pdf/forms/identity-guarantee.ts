import type { Case } from '@/types/case';
import type { FormDefinition } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';

// TODO: PDF 템플릿 준비 후 실제 필드명으로 매핑 작성
const textFieldMappings: TextFieldMapping[] = [];
const checkboxMappings: CheckboxMapping[] = [];
const fieldLabels: Record<string, string> = {};
const checkboxLabels: Record<string, string> = {};

export const identityGuaranteeForm: FormDefinition = {
  id: 'identity_guarantee',
  label: '신원보증서',
  templatePath: '/forms/identity_guarantee.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldLabels,
  checkboxLabels,
  applicableVisas: ['E-7', 'F-6'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `신원보증서_${name}.pdf`;
  },
};
