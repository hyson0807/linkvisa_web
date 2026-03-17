'use client';

import { useMemo, useState } from 'react';
import type { Case } from '@/types/case';
import '@/lib/pdf/forms';
import { getFormsForCase } from '@/lib/pdf/form-registry';
import { analyzeMappingStatus } from '@/lib/pdf/analyze';
import { useCaseStore } from '@/store/case-store';
import {
  ALIEN_REG_FIELDS,
  APP_TYPE_QUAL_FIELDS,
  UNIFIED_FIELD_GROUPS,
  GROUPED_FIELDS,
  getDefaultValue,
  type FieldGroup,
  type AnyField,
} from './constants';
import FieldGroupSection from './FieldGroupSection';
import FieldInput from './FieldInput';
import BirthSexSection from './BirthSexSection';
import SchoolSection from './SchoolSection';
import AlienRegRow from './AlienRegRow';

interface MappingStepProps {
  caseData: Case;
  onNext: () => void;
  onPrev: () => void;
}

// ── Main component ──

export default function MappingStep({ caseData, onNext, onPrev }: MappingStepProps) {
  const forms = useMemo(() => getFormsForCase(caseData), [caseData]);
  const setManualField = useCaseStore((s) => s.setManualField);

  const [activeFormId, setActiveFormId] = useState<string>(
    forms.length > 0 ? forms[0].id : '',
  );

  const [localInputs, setLocalInputs] = useState<Record<string, string>>({});

  const formAnalyses = useMemo(
    () => forms.map((formDef) => ({
      formDef,
      analysis: analyzeMappingStatus(formDef, caseData),
    })),
    [forms, caseData],
  );

  const hasMappings = (formDef: typeof forms[0]) =>
    formDef.textFieldMappings.length > 0 || formDef.checkboxMappings.length > 0;

  const handleInputBlur = (pdfField: string, value: string) => {
    setManualField(caseData.id, pdfField, value.trim());
  };

  const handleInputChange = (pdfField: string, value: string) => {
    setLocalInputs((prev) => ({ ...prev, [pdfField]: value }));
  };

  const getFieldValue = (pdfField: string, fallback?: string) =>
    localInputs[pdfField] ?? caseData.manualFields?.[pdfField] ?? fallback ?? '';

  /** Build a lookup from pdfField → AnyField (mapped or unmapped) */
  const buildFieldMap = (analysis: ReturnType<typeof analyzeMappingStatus>) => {
    const map = new Map<string, AnyField>();
    for (const f of analysis.mapped) map.set(f.pdfField, { ...f, isMapped: true });
    for (const f of analysis.unmapped) map.set(f.pdfField, { ...f, isMapped: false });
    return map;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">매핑 확인</h2>
        <p className="mt-1 text-sm text-gray-500">
          PDF 양식에 매핑된 데이터를 확인하고, 값을 직접 수정하세요.
        </p>
      </div>

      {/* Form tabs */}
      <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-black/5 overflow-x-auto">
          {formAnalyses.map(({ formDef, analysis }) => {
            const isActive = activeFormId === formDef.id;
            const mappedCount = analysis.mapped.length;
            const unmappedCount = analysis.unmapped.length;
            const hasMappingData = hasMappings(formDef);

            return (
              <button
                key={formDef.id}
                type="button"
                onClick={() => setActiveFormId(formDef.id)}
                className={`relative shrink-0 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-white'
                    : 'bg-black/[0.02] hover:bg-black/[0.04]'
                }`}
              >
                <span className={`block text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'text-primary' : 'text-black/50'
                }`}>
                  {formDef.label}
                </span>
                {hasMappingData ? (
                  <span className={`block mt-0.5 text-[10px] whitespace-nowrap ${
                    isActive ? 'text-black/40' : 'text-black/30'
                  }`}>
                    {mappedCount}개 매핑{unmappedCount > 0 && ` · ${unmappedCount}개 미입력`}
                  </span>
                ) : (
                  <span className="block mt-0.5 text-[10px] text-black/25">준비중</span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {formAnalyses.map(({ formDef, analysis }) => {
          if (formDef.id !== activeFormId) return null;
          const hasMappingData = hasMappings(formDef);

          return (
            <div key={formDef.id} className="p-5">
              {!hasMappingData ? (
                <p className="text-xs text-black/30 py-2">PDF 템플릿 준비 후 매핑이 추가됩니다.</p>
              ) : (
                (() => {
                  const fieldMap = buildFieldMap(analysis);
                  const isUnified = formDef.id === 'unified_application';
                  const qualFields = APP_TYPE_QUAL_FIELDS[caseData.applicationType ?? ''];
                  const qualGroup: FieldGroup[] = qualFields
                    ? [{ id: 'qual', label: '신청 자격', fields: qualFields, cols: '1fr 1fr' }]
                    : [];
                  const groups = isUnified ? [...qualGroup, ...UNIFIED_FIELD_GROUPS] : [];

                  // Fields not in any group
                  const ungroupedFields = [...fieldMap.entries()]
                    .filter(([key]) => !GROUPED_FIELDS.has(key))
                    .map(([, f]) => f);

                  return (
                    <div className="space-y-3">
                      {/* Grouped sections (unified_application only) */}
                      {groups.map((group) => {
                        const groupFields = group.fields
                          .map((f) => fieldMap.get(f))
                          .filter((f): f is AnyField => !!f);
                        if (groupFields.length === 0) return null;

                        // Special: birth date + sex
                        if (group.id === 'birth_sex') {
                          return (
                            <BirthSexSection
                              key={group.label}
                              group={group}
                              fields={groupFields}
                              caseData={caseData}
                              getFieldValue={getFieldValue}
                              onFieldChange={handleInputChange}
                              onFieldBlur={handleInputBlur}
                              onManualField={(fieldId, val) => setManualField(caseData.id, fieldId, val)}
                            />
                          );
                        }

                        // Special: school info with selects
                        if (group.id === 'school') {
                          return (
                            <SchoolSection
                              key={group.label}
                              group={group}
                              fields={groupFields}
                              caseData={caseData}
                              getFieldValue={getFieldValue}
                              onFieldChange={handleInputChange}
                              onFieldBlur={handleInputBlur}
                              onManualField={(fieldId, val) => setManualField(caseData.id, fieldId, val)}
                            />
                          );
                        }

                        // Special: alien reg row
                        if (group.id === 'alien_reg') {
                          const digits = ALIEN_REG_FIELDS.map((field) => {
                            const f = fieldMap.get(field);
                            return getFieldValue(field, f ? getDefaultValue(f) : '');
                          });
                          return (
                            <AlienRegRow
                              key={group.label}
                              digits={digits}
                              onDigitChange={(idx, val) => handleInputChange(ALIEN_REG_FIELDS[idx], val)}
                              onDigitBlur={(idx, val) => handleInputBlur(ALIEN_REG_FIELDS[idx], val)}
                            />
                          );
                        }

                        return (
                          <FieldGroupSection
                            key={group.label}
                            group={group}
                            fields={groupFields}
                            getFieldValue={getFieldValue}
                            onFieldChange={handleInputChange}
                            onFieldBlur={handleInputBlur}
                          />
                        );
                      })}

                      {/* Ungrouped fields (other forms, or fields not in groups) */}
                      {ungroupedFields.length > 0 && (
                        <div className="space-y-1">
                          {ungroupedFields.map((f) => (
                            <FieldInput
                              key={f.pdfField}
                              field={f}
                              value={getFieldValue(f.pdfField, getDefaultValue(f))}
                              onChange={(val) => handleInputChange(f.pdfField, val)}
                              onBlur={(val) => handleInputBlur(f.pdfField, val)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 데이터 추출
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
        >
          공문서 확인 →
        </button>
      </div>
    </div>
  );
}
