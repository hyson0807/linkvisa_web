import type { Case } from '@/types/case';
import type { FormDefinition } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';

// TODO: PDF 템플릿 준비 후 실제 필드명으로 매핑 작성
const textFieldMappings: TextFieldMapping[] = [];
const checkboxMappings: CheckboxMapping[] = [];
const fieldLabels: Record<string, string> = {};
const checkboxLabels: Record<string, string> = {};

export const residenceConfirmForm: FormDefinition = {
  id: 'residence_confirmation',
  label: '거주숙소 제공확인서',
  templatePath: '/forms/residence_confirmation.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldLabels,
  checkboxLabels,
  applicableVisas: ['E-7'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `거주숙소_제공확인서_${name}.pdf`;
  },
};
