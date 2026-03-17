import type { Case } from '@/types/case';
import type { TextFieldMapping, CheckboxMapping } from './field-utils';

export type FormId = string;

export interface FieldGroup {
  id: string;
  label: string;
  fields: string[];
  /** grid column template, e.g. '1fr 1fr' or '2fr 1fr 1fr' */
  cols?: string;
}

export interface FormDefinition {
  id: FormId;
  label: string;
  templatePath: string;
  textFieldMappings: TextFieldMapping[];
  checkboxMappings: CheckboxMapping[];
  fieldLabels: Record<string, string>;
  checkboxLabels: Record<string, string>;
  applicableVisas: string[];
  /** Optional fine-grained condition beyond visa type */
  isApplicable?: (caseData: Case) => boolean;
  fieldGroups?: FieldGroup[];
  buildFileName: (caseData: Case) => string;
}

const registry = new Map<FormId, FormDefinition>();

export function registerForm(def: FormDefinition): void {
  registry.set(def.id, def);
}

export function getForm(id: FormId): FormDefinition | undefined {
  return registry.get(id);
}

export function getAllForms(): FormDefinition[] {
  return Array.from(registry.values());
}

export function getFormsForCase(caseData: Case): FormDefinition[] {
  return getAllForms().filter((def) => {
    const visaMatch = def.applicableVisas.includes(caseData.visaType);
    if (!visaMatch) return false;
    if (def.isApplicable) return def.isApplicable(caseData);
    return true;
  });
}
