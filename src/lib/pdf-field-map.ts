// Re-export wrapper for backward compatibility
// New code should import from '@/lib/pdf/field-utils', '@/lib/pdf/analyze', etc.

import type { Case } from '@/types/case';
import '@/lib/pdf/forms'; // ensure all forms are registered
import { getForm } from '@/lib/pdf/form-registry';
import { analyzeMappingStatus as analyzeFormMappingStatus } from '@/lib/pdf/analyze';

export type { TextFieldMapping, CheckboxMapping, FieldSource, Transform } from '@/lib/pdf/field-utils';
export { getOcrValue, getManualValue, resolveSource, applyTransform } from '@/lib/pdf/field-utils';
export type { MappedField, UnmappedField, MappingAnalysis } from '@/lib/pdf/analyze';

// Legacy single-form exports from unified-application
import { unifiedApplicationForm } from '@/lib/pdf/forms/unified-application';
export const textFieldMappings = unifiedApplicationForm.textFieldMappings;
export const checkboxMappings = unifiedApplicationForm.checkboxMappings;

/** @deprecated Use analyzeMappingStatus(formDef, caseData) from '@/lib/pdf/analyze' */
export function analyzeMappingStatus(caseData: Case) {
  const formDef = getForm('unified_application');
  if (!formDef) throw new Error('unified_application form not registered');
  return analyzeFormMappingStatus(formDef, caseData);
}
