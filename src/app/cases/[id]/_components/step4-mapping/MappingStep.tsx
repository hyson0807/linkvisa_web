'use client';

import { useMemo, useState, useRef } from 'react';
import type { Case } from '@/types/case';
import '@/lib/pdf/forms';
import { getFormsForCase } from '@/lib/pdf/form-registry';
import { analyzeMappingStatus, type MappedField, type UnmappedField } from '@/lib/pdf/analyze';
import { ocrFallback } from '@/lib/pdf/field-utils';
import { useCaseStore } from '@/store/case-store';

// ── Field grouping definitions ──

const ALIEN_REG_FIELDS = Array.from({ length: 13 }, (_, i) => `t${12 + i}`);

interface FieldGroup {
  label: string;
  fields: string[];
  /** grid column template, e.g. '1fr 1fr' or '2fr 1fr 1fr' */
  cols?: string;
}

// applicationType → 신청 자격 필드 매핑
const APP_TYPE_QUAL_FIELDS: Record<string, string[]> = {
  '체류자격변경허가': ['t1', 't2'],
  '체류자격부여': ['t3', 't4'],
  '체류자격 외 활동허가': ['t5', 't6'],
};

const UNIFIED_FIELD_GROUPS: FieldGroup[] = [
  { label: '성명', fields: ['t7', 't8'], cols: '1fr 1fr' },
  { label: '생년월일 · 성별', fields: ['t9', 't10', 't11'], cols: '1fr 1fr 1fr' },
  { label: '외국인등록번호', fields: ALIEN_REG_FIELDS },
  { label: '국적', fields: ['t25'] },
  { label: '여권 정보', fields: ['t26', 't27', 't28'], cols: '1fr 1fr 1fr' },
  { label: '연락처 (국내)', fields: ['t29', 't30', 't31'], cols: '2fr 1fr 1fr' },
  { label: '연락처 (본국)', fields: ['t32', 't33'], cols: '2fr 1fr' },
  { label: '학교 정보', fields: ['t34', 't35'], cols: '2fr 1fr' },
  { label: '원 근무처', fields: ['t36', 't37', 't38'], cols: '1fr 1fr 1fr' },
  { label: '예정 근무처', fields: ['t39', 't40', 't41'], cols: '1fr 1fr 1fr' },
  { label: '소득 · 직업', fields: ['t42', 't43'], cols: '1fr 1fr' },
  { label: '기타', fields: ['t44', 't45', 't46', 't47'], cols: '1fr 1fr' },
];

// All grouped field ids (flat set) – includes all 신청 자격 fields (t1-t6) even though they're conditionally shown
const GROUPED_FIELDS = new Set([
  ...UNIFIED_FIELD_GROUPS.flatMap((g) => g.fields),
  't1', 't2', 't3', 't4', 't5', 't6',
]);

// ── Types ──

type AnyField = (MappedField | UnmappedField) & { isMapped: boolean };

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
                    ? [{ label: '신청 자격', fields: qualFields, cols: '1fr 1fr' }]
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
                        if (group.label === '생년월일 · 성별') {
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
                        if (group.label === '학교 정보') {
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
                        if (group.label === '외국인등록번호') {
                          const digits = ALIEN_REG_FIELDS.map((field) => {
                            const mapped = analysis.mapped.find((f) => f.pdfField === field);
                            return getFieldValue(field, mapped?.value);
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
                              value={getFieldValue(f.pdfField, f.isMapped ? (f as MappedField).value : '')}
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

// ── Grouped section card ──

function FieldGroupSection({
  group,
  fields,
  getFieldValue,
  onFieldChange,
  onFieldBlur,
}: {
  group: FieldGroup;
  fields: AnyField[];
  getFieldValue: (pdfField: string, fallback?: string) => string;
  onFieldChange: (pdfField: string, val: string) => void;
  onFieldBlur: (pdfField: string, val: string) => void;
}) {
  const allFilled = fields.every(
    (f) => getFieldValue(f.pdfField, f.isMapped ? (f as MappedField).value : '') !== '',
  );

  return (
    <div className={`rounded-md px-3 py-2.5 ${allFilled ? 'bg-emerald-50/50' : 'bg-black/[0.02]'}`}>
      <p className="mb-2 text-xs font-semibold text-black/50">{group.label}</p>
      <div
        className="gap-2"
        style={{
          display: 'grid',
          gridTemplateColumns: group.cols ?? '1fr',
        }}
      >
        {fields.map((f) => {
          const val = getFieldValue(f.pdfField, f.isMapped ? (f as MappedField).value : '');
          const filled = val !== '';
          return (
            <div key={f.pdfField}>
              <div className="mb-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[11px] font-medium text-black/50">{f.label}</span>
                <span className="text-[9px] text-black/20">{f.pdfField}</span>
              </div>
              <input
                type="text"
                placeholder={f.label}
                value={val}
                onChange={(e) => onFieldChange(f.pdfField, e.target.value)}
                onBlur={(e) => onFieldBlur(f.pdfField, e.target.value)}
                className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 placeholder:text-black/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                  filled ? 'border-emerald-200' : 'border-black/10'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Single field input (for ungrouped) ──

function FieldInput({
  field,
  value,
  onChange,
  onBlur,
}: {
  field: AnyField;
  value: string;
  onChange: (val: string) => void;
  onBlur: (val: string) => void;
}) {
  const filled = value !== '';
  return (
    <div className={`rounded-md px-3 py-2 ${filled ? 'bg-emerald-50/50' : 'bg-amber-50/50'}`}>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-black/60">{field.label}</span>
        <span className="text-[10px] text-black/30">{field.pdfField}</span>
      </div>
      <input
        type="text"
        placeholder={`${field.label} 입력`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(e.target.value)}
        className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 placeholder:text-black/25 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
          filled ? 'border-emerald-200' : 'border-amber-200'
        }`}
      />
    </div>
  );
}

// ── Birth date + Sex section ──

const SEX_OPTIONS = [
  { value: '남', label: '남 (M)' },
  { value: '여', label: '여 (F)' },
];

function BirthSexSection({
  group,
  fields,
  caseData,
  getFieldValue,
  onFieldChange,
  onFieldBlur,
  onManualField,
}: {
  group: FieldGroup;
  fields: AnyField[];
  caseData: Case;
  getFieldValue: (pdfField: string, fallback?: string) => string;
  onFieldChange: (pdfField: string, val: string) => void;
  onFieldBlur: (pdfField: string, val: string) => void;
  onManualField: (fieldId: string, val: string) => void;
}) {
  // Resolve current sex: manual override → OCR
  const ocrSex = ocrFallback(caseData, ['passport', '성별'], ['alien_registration', '성별']).toUpperCase();
  const normalizedOcrSex = (ocrSex === 'M' || ocrSex === '남') ? '남' : (ocrSex === 'F' || ocrSex === '여') ? '여' : '';
  const sex = caseData.manualFields?.sex || normalizedOcrSex;

  return (
    <div className="rounded-md bg-black/[0.02] px-3 py-2.5">
      <p className="mb-2 text-xs font-semibold text-black/50">{group.label}</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
        {fields.map((f) => {
          const val = getFieldValue(f.pdfField, f.isMapped ? (f as MappedField).value : '');
          const filled = val !== '';
          return (
            <div key={f.pdfField}>
              <div className="mb-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[11px] font-medium text-black/50">{f.label}</span>
                <span className="text-[9px] text-black/20">{f.pdfField}</span>
              </div>
              <input
                type="text"
                placeholder={f.label}
                value={val}
                onChange={(e) => onFieldChange(f.pdfField, e.target.value)}
                onBlur={(e) => onFieldBlur(f.pdfField, e.target.value)}
                className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 placeholder:text-black/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                  filled ? 'border-emerald-200' : 'border-black/10'
                }`}
              />
            </div>
          );
        })}
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-black/50">성별</span>
          <select
            value={sex}
            onChange={(e) => onManualField('sex', e.target.value)}
            className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
              sex ? 'border-emerald-200' : 'border-black/10'
            }`}
          >
            {SEX_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ── School info section with selects ──

const SCHOOL_STATUS_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '미취학', label: '미취학' },
  { value: '초', label: '초등학교' },
  { value: '중', label: '중학교' },
  { value: '고', label: '고등학교' },
];

const SCHOOL_TYPE_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '교육청 인가', label: '교육청 인가' },
  { value: '교육청 비인가', label: '교육청 비인가' },
  { value: '대안학교', label: '대안학교' },
];

function SchoolSection({
  group,
  fields,
  caseData,
  getFieldValue,
  onFieldChange,
  onFieldBlur,
  onManualField,
}: {
  group: FieldGroup;
  fields: AnyField[];
  caseData: Case;
  getFieldValue: (pdfField: string, fallback?: string) => string;
  onFieldChange: (pdfField: string, val: string) => void;
  onFieldBlur: (pdfField: string, val: string) => void;
  onManualField: (fieldId: string, val: string) => void;
}) {
  const schoolStatus = caseData.manualFields?.school_status ?? '';
  const schoolType = caseData.manualFields?.school_type ?? '';

  return (
    <div className="rounded-md bg-black/[0.02] px-3 py-2.5">
      <p className="mb-2 text-xs font-semibold text-black/50">{group.label}</p>

      {/* Selects row */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-black/50">재학 여부</span>
          <select
            value={schoolStatus}
            onChange={(e) => onManualField('school_status', e.target.value)}
            className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
              schoolStatus ? 'border-emerald-200' : 'border-black/10'
            }`}
          >
            {SCHOOL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="mb-0.5 block text-[11px] font-medium text-black/50">학교 종류</span>
          <select
            value={schoolType}
            onChange={(e) => onManualField('school_type', e.target.value)}
            className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
              schoolType ? 'border-emerald-200' : 'border-black/10'
            }`}
          >
            {SCHOOL_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Text fields */}
      <div
        className="gap-2"
        style={{ display: 'grid', gridTemplateColumns: group.cols ?? '1fr' }}
      >
        {fields.map((f) => {
          const val = getFieldValue(f.pdfField, f.isMapped ? (f as MappedField).value : '');
          const filled = val !== '';
          return (
            <div key={f.pdfField}>
              <div className="mb-0.5 flex items-baseline justify-between gap-1">
                <span className="text-[11px] font-medium text-black/50">{f.label}</span>
                <span className="text-[9px] text-black/20">{f.pdfField}</span>
              </div>
              <input
                type="text"
                placeholder={f.label}
                value={val}
                onChange={(e) => onFieldChange(f.pdfField, e.target.value)}
                onBlur={(e) => onFieldBlur(f.pdfField, e.target.value)}
                className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 placeholder:text-black/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                  filled ? 'border-emerald-200' : 'border-black/10'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Alien Registration Number: 13-digit inline row ──

function AlienRegRow({
  digits,
  onDigitChange,
  onDigitBlur,
}: {
  digits: string[];
  onDigitChange: (idx: number, val: string) => void;
  onDigitBlur: (idx: number, val: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const filled = digits.some((d) => d !== '');

  return (
    <div className={`rounded-md px-3 py-2.5 ${filled ? 'bg-emerald-50/50' : 'bg-black/[0.02]'}`}>
      <p className="mb-2 text-xs font-semibold text-black/50">외국인등록번호</p>
      <div className="flex items-center gap-0.5">
        {digits.map((digit, i) => (
          <span key={i} className="contents">
            {i === 6 && (
              <span className="mx-1 text-sm font-bold text-black/30">-</span>
            )}
            <input
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                onDigitChange(i, val);
                if (val && i < 12) {
                  inputRefs.current[i + 1]?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !e.currentTarget.value && i > 0) {
                  inputRefs.current[i - 1]?.focus();
                }
              }}
              onBlur={(e) => onDigitBlur(i, e.target.value)}
              className={`h-8 w-6 rounded border text-center text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                filled ? 'border-emerald-200 bg-white' : 'border-black/10 bg-white'
              }`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
