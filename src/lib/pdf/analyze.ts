import type { Case } from '@/types/case';
import type { FormDefinition } from './form-registry';
import { getFormsForCase } from './form-registry';
import { resolveSource, applyTransform, describeSource } from './field-utils';

export interface MappedField {
  pdfField: string;
  label: string;
  value: string;
  sourceDesc: string;
}

export interface UnmappedField {
  pdfField: string;
  label: string;
  sourceDesc: string;
}

export interface MappingAnalysis {
  mapped: MappedField[];
  unmapped: UnmappedField[];
  checkedBoxes: string[];
}

export function analyzeMappingStatus(formDef: FormDefinition, caseData: Case): MappingAnalysis {
  const mapped: MappedField[] = [];
  const unmapped: UnmappedField[] = [];

  // 1. Analyze text field mappings
  for (const m of formDef.textFieldMappings) {
    // Skip intentionally empty static fields
    if (m.source.type === 'static' && m.source.value === '') continue;

    const manualOverride = caseData.manualFields?.[m.field];
    const rawValue = manualOverride || resolveSource(caseData, m.source);
    const value = applyTransform(rawValue, m.transform, m.digitIndex);

    if (value) {
      mapped.push({
        pdfField: m.field,
        label: formDef.fieldLabels[m.field] ?? m.field,
        value,
        sourceDesc: describeSource(m.source),
      });
    } else {
      unmapped.push({
        pdfField: m.field,
        label: formDef.fieldLabels[m.field] ?? m.field,
        sourceDesc: describeSource(m.source),
      });
    }
  }

  // 3. Checked checkboxes
  const checkedBoxes: string[] = [];
  for (const cb of formDef.checkboxMappings) {
    try {
      if (cb.condition(caseData)) {
        checkedBoxes.push(formDef.checkboxLabels[cb.field] ?? cb.field);
      }
    } catch {
      // skip
    }
  }

  return { mapped, unmapped, checkedBoxes };
}

export function analyzeAllForms(caseData: Case): { formId: string; label: string; analysis: MappingAnalysis }[] {
  const forms = getFormsForCase(caseData);
  return forms.map((formDef) => ({
    formId: formDef.id,
    label: formDef.label,
    analysis: analyzeMappingStatus(formDef, caseData),
  }));
}
