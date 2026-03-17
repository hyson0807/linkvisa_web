import type { Case } from '@/types/case';
import { documentRegistry } from './document-registry';

// ── Source types ──

type FieldSource =
  | { type: 'ocr'; docType: string; key: string }
  | { type: 'manual'; fieldId: string }
  | { type: 'case'; key: keyof Case }
  | { type: 'static'; value: string }
  | { type: 'computed'; fn: (c: Case) => string };

type Transform =
  | 'none'
  | 'split-surname'
  | 'split-given'
  | 'date-yyyy'
  | 'date-mm'
  | 'date-dd'
  | 'alien-reg-digit'; // index provided separately

export interface TextFieldMapping {
  field: string;
  source: FieldSource;
  transform?: Transform;
  /** For alien-reg-digit: which digit index (0-based) */
  digitIndex?: number;
}

export interface CheckboxMapping {
  field: string;
  condition: (c: Case) => boolean;
}

// ── Helper: get OCR value from a case ──

export function getOcrValue(c: Case, docType: string, key: string): string {
  // 1) Exact typeId match
  const exact = c.documents.find((d) => d.typeId === docType);
  if (exact?.ocrResult && key in exact.ocrResult) return exact.ocrResult[key];

  // 2) Fallback: search only custom (user-added) documents
  for (const d of c.documents) {
    if (d.isCustom && d.ocrResult && key in d.ocrResult) return d.ocrResult[key];
  }
  return '';
}

/** Try multiple (docType, key) pairs and return the first non-empty value */
function ocrFallback(c: Case, ...sources: [docType: string, key: string][]): string {
  for (const [docType, key] of sources) {
    const v = getOcrValue(c, docType, key);
    if (v) return v;
  }
  return '';
}

export function getManualValue(c: Case, fieldId: string): string {
  return c.manualFields[fieldId] ?? '';
}

// ── Resolve a single source ──

export function resolveSource(c: Case, source: FieldSource): string {
  switch (source.type) {
    case 'ocr':
      return getOcrValue(c, source.docType, source.key);
    case 'manual':
      return getManualValue(c, source.fieldId);
    case 'case':
      return (c[source.key] as string) ?? '';
    case 'static':
      return source.value;
    case 'computed':
      return source.fn(c);
  }
}

// ── Apply transform ──

function splitName(fullName: string): { surname: string; given: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { surname: fullName.trim(), given: '' };
  return { surname: parts[0], given: parts.slice(1).join(' ') };
}

const MONTH_NAMES: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

function parseDate(dateStr: string): { yyyy: string; mm: string; dd: string } | null {
  const s = dateStr.trim();

  // "DD MON YYYY" (passport MRZ format, e.g. "04 MAR 1979")
  const dmy = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (dmy) {
    const mm = MONTH_NAMES[dmy[2].toUpperCase()];
    if (mm) return { yyyy: dmy[3], mm, dd: dmy[1].padStart(2, '0') };
  }

  // Numeric with separators: YYYY-MM-DD, YYYY.MM.DD, YYYY/MM/DD, DD-MM-YYYY, DD/MM/YYYY
  const sep = s.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (sep) return { yyyy: sep[1], mm: sep[2].padStart(2, '0'), dd: sep[3].padStart(2, '0') };

  const sepRev = s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (sepRev) return { yyyy: sepRev[3], mm: sepRev[2].padStart(2, '0'), dd: sepRev[1].padStart(2, '0') };

  // Pure digits: YYYYMMDD
  const digits = s.replace(/\D/g, '');
  if (digits.length === 8) return { yyyy: digits.slice(0, 4), mm: digits.slice(4, 6), dd: digits.slice(6, 8) };

  return null;
}

function parseDatePart(dateStr: string, part: 'yyyy' | 'mm' | 'dd'): string {
  const d = parseDate(dateStr);
  return d ? d[part] : '';
}

export function applyTransform(value: string, transform: Transform | undefined, digitIndex?: number): string {
  if (!transform || transform === 'none') return value;
  switch (transform) {
    case 'split-surname':
      return splitName(value).surname;
    case 'split-given':
      return splitName(value).given;
    case 'date-yyyy':
      return parseDatePart(value, 'yyyy');
    case 'date-mm':
      return parseDatePart(value, 'mm');
    case 'date-dd':
      return parseDatePart(value, 'dd');
    case 'alien-reg-digit': {
      const digits = value.replace(/[^0-9]/g, '');
      return digits[digitIndex ?? 0] ?? '';
    }
    default:
      return value;
  }
}

// ── Checkbox mappings ──
// c1-c10: application type checkboxes
// c11: 남 M, c12: 여 F
// c13-c16: school status (미취학, 초, 중, 고)
// c17-c18: school type

function getSex(c: Case): string {
  return ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']).toUpperCase();
}

export const checkboxMappings: CheckboxMapping[] = [
  { field: 'c1', condition: (c) => c.applicationType === '외국인등록' },
  { field: 'c2', condition: (c) => c.applicationType === '등록증재발급' },
  { field: 'c3', condition: (c) => c.applicationType === '체류기간연장허가' },
  { field: 'c4', condition: (c) => c.applicationType === '체류자격변경허가' },
  { field: 'c5', condition: (c) => c.applicationType === '체류자격부여' },
  { field: 'c6', condition: () => false }, // 체류자격 외 활동허가 - rarely used
  { field: 'c7', condition: (c) => c.applicationType === '근무처변경추가' },
  { field: 'c8', condition: () => false }, // 재입국허가
  { field: 'c9', condition: (c) => c.applicationType === '체류지변경신고' },
  { field: 'c10', condition: (c) => c.applicationType === '등록사항변경신고' },
  // Sex (passport → alien_registration fallback)
  { field: 'c11', condition: (c) => { const v = getSex(c); return v === '남' || v === 'M'; } },
  { field: 'c12', condition: (c) => { const v = getSex(c); return v === '여' || v === 'F'; } },
];

// ── Text field mappings ──
// t1: 체류자격변경 희망자격, t2: status to apply for (change)
// t3: 체류자격부여 희망자격, t4: status to apply for (granting)
// t5: 체류자격외활동 희망자격, t6: status to apply for
// t7: 성 Surname, t8: 명 Given names
// t9: 생년월일 yyyy, t10: mm, t11: dd
// t12-t24: 외국인등록번호 (13 digits)
// t25: 국적, t26: 여권번호
// t27: 여권발급일자, t28: 여권유효기간
// t29: 대한민국 내 주소, t30: 전화번호, t31: 휴대전화
// t32: 본국 주소, t33: 전화번호(본국)
// t34: 학교이름, t35: 학교전화
// t36: 원근무처, t37: 사업자등록번호(현), t38: 전화(현)
// t39: 예정근무처, t40: 사업자등록번호(신), t41: 전화(신)
// t42: 연소득금액, t43: 직업
// t44: 재입국기간, t45: 이메일, t46: 반환용 계좌번호
// t47: 신청일
// t48-t65: 공용란 (official use only)

// ── Field labels for UI display ──

const fieldLabels: Record<string, string> = {
  t1: '변경 희망자격 (코드)',
  t2: '변경 희망자격 (영문)',
  t3: '부여 희망자격 (코드)',
  t4: '부여 희망자격 (영문)',
  t7: '성 (Surname)',
  t8: '이름 (Given names)',
  t9: '생년 (yyyy)',
  t10: '월 (mm)',
  t11: '일 (dd)',
  t25: '국적',
  t26: '여권번호',
  t27: '여권발급일자',
  t28: '여권만료일',
  t29: '대한민국 내 주소',
  t30: '전화번호',
  t31: '휴대전화',
  t32: '본국 주소',
  t33: '본국 전화번호',
  t36: '원 근무처',
  t37: '사업자등록번호 (현)',
  t39: '예정 근무처',
  t40: '사업자등록번호 (신)',
  t42: '연 소득금액',
  t43: '직업',
  t45: '이메일',
  t46: '반환용 계좌번호',
  t47: '신청일',
};

// Alien registration digit fields (t12-t24)
for (let i = 0; i < 13; i++) {
  fieldLabels[`t${12 + i}`] = `외국인등록번호 (${i + 1}번째 자리)`;
}

function getDocTypeLabel(typeId: string): string {
  return documentRegistry.find((d) => d.id === typeId)?.label ?? typeId;
}

const checkboxLabels: Record<string, string> = {
  c1: '외국인등록',
  c2: '등록증재발급',
  c3: '체류기간연장허가',
  c4: '체류자격변경허가',
  c5: '체류자격부여',
  c6: '체류자격 외 활동허가',
  c7: '근무처변경추가',
  c8: '재입국허가',
  c9: '체류지변경신고',
  c10: '등록사항변경신고',
  c11: '남 (M)',
  c12: '여 (F)',
};

// ── Mapping analysis ──

export interface MappedField {
  pdfField: string;
  label: string;
  value: string;
  sourceDesc: string;
}

export interface UnmappedField {
  docLabel: string;
  key: string;
  value: string;
}

export interface MappingAnalysis {
  mapped: MappedField[];
  unmapped: UnmappedField[];
  checkedBoxes: string[];
}

function describeSource(source: FieldSource): string {
  switch (source.type) {
    case 'ocr':
      return `${getDocTypeLabel(source.docType)} → ${source.key}`;
    case 'manual':
      return `수동 입력 → ${source.fieldId}`;
    case 'case':
      return `케이스 정보 → ${source.key}`;
    case 'static':
      return '고정값';
    case 'computed':
      return '자동 계산';
  }
}

export function analyzeMappingStatus(caseData: Case): MappingAnalysis {
  const mapped: MappedField[] = [];
  const referencedOcrKeys = new Set<string>(); // "docType::key" format

  // 1. Analyze text field mappings
  for (const m of textFieldMappings) {
    const rawValue = resolveSource(caseData, m.source);
    const value = applyTransform(rawValue, m.transform, m.digitIndex);

    // Track OCR references
    if (m.source.type === 'ocr') {
      referencedOcrKeys.add(`${m.source.docType}::${m.source.key}`);
    }

    if (value) {
      mapped.push({
        pdfField: m.field,
        label: fieldLabels[m.field] ?? m.field,
        value,
        sourceDesc: describeSource(m.source),
      });
    }
  }

  // 2. Find unmapped OCR fields (only from document types referenced by mappings)
  const referencedDocTypes = new Set(
    textFieldMappings
      .filter((m) => m.source.type === 'ocr')
      .map((m) => (m.source as { type: 'ocr'; docType: string; key: string }).docType),
  );
  const unmapped: UnmappedField[] = [];
  for (const doc of caseData.documents) {
    if (!doc.ocrResult || !referencedDocTypes.has(doc.typeId)) continue;
    for (const [key, value] of Object.entries(doc.ocrResult)) {
      if (!value) continue;
      if (!referencedOcrKeys.has(`${doc.typeId}::${key}`)) {
        unmapped.push({
          docLabel: getDocTypeLabel(doc.typeId),
          key,
          value,
        });
      }
    }
  }

  // 3. Checked checkboxes
  const checkedBoxes: string[] = [];
  for (const cb of checkboxMappings) {
    try {
      if (cb.condition(caseData)) {
        checkedBoxes.push(checkboxLabels[cb.field] ?? cb.field);
      }
    } catch {
      // skip
    }
  }

  return { mapped, unmapped, checkedBoxes };
}

export const textFieldMappings: TextFieldMapping[] = [
  // Application type visa code fields
  {
    field: 't1',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격변경허가' ? c.visaType : '' },
  },
  {
    field: 't2',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격변경허가' ? c.visaType : '' },
  },
  {
    field: 't3',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격부여' ? c.visaType : '' },
  },
  {
    field: 't4',
    source: { type: 'computed', fn: (c) => c.applicationType === '체류자격부여' ? c.visaType : '' },
  },

  // Name (passport → alien_registration fallback)
  {
    field: 't7',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-surname',
  },
  {
    field: 't8',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-given',
  },

  // Date of birth (passport → alien_registration fallback)
  {
    field: 't9',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-yyyy',
  },
  {
    field: 't10',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-mm',
  },
  {
    field: 't11',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-dd',
  },

  // Foreign Resident Registration No. (t12-t24, 13 digits)
  ...Array.from({ length: 13 }, (_, i) => ({
    field: `t${12 + i}`,
    source: { type: 'ocr' as const, docType: 'alien_registration', key: '외국인등록번호' },
    transform: 'alien-reg-digit' as const,
    digitIndex: i,
  })),

  // Nationality (passport → alien_registration fallback)
  {
    field: 't25',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '국적'], ['alien_registration', '국적']) },
  },

  // Passport
  {
    field: 't26',
    source: { type: 'ocr', docType: 'passport', key: '여권번호' },
  },
  {
    field: 't27',
    source: { type: 'ocr', docType: 'passport', key: '여권발급일' },
  },
  {
    field: 't28',
    source: { type: 'ocr', docType: 'passport', key: '여권만료일' },
  },

  // Address in Korea
  {
    field: 't29',
    source: { type: 'static', value: '' },
  },

  // Phone numbers
  {
    field: 't30',
    source: { type: 'manual', fieldId: 'applicant_phone_kr' },
  },
  {
    field: 't31',
    source: { type: 'manual', fieldId: 'applicant_phone_kr' },
  },

  // Home country address & phone - leave empty for now
  { field: 't32', source: { type: 'static', value: '' } },
  { field: 't33', source: { type: 'static', value: '' } },

  // Workplace - current
  {
    field: 't36',
    source: { type: 'ocr', docType: 'business_reg', key: '상호' },
  },
  {
    field: 't37',
    source: { type: 'ocr', docType: 'business_reg', key: '사업자등록번호' },
  },

  // Workplace - new (for 근무처변경 cases, use same company)
  {
    field: 't39',
    source: { type: 'computed', fn: (c) =>
      c.applicationType === '근무처변경추가' ? '' : getOcrValue(c, 'business_reg', '상호')
    },
  },
  {
    field: 't40',
    source: { type: 'computed', fn: (c) =>
      c.applicationType === '근무처변경추가' ? '' : getOcrValue(c, 'business_reg', '사업자등록번호')
    },
  },

  // Annual income
  {
    field: 't42',
    source: { type: 'manual', fieldId: 'annual_income' },
  },

  // Occupation
  {
    field: 't43',
    source: { type: 'computed', fn: (c) =>
      ocrFallback(c, ['employment_contract', '근무내용'], ['employment_contract', '직위'])
    },
  },

  // Email
  {
    field: 't45',
    source: { type: 'static', value: '' },
  },

  // Refund bank account
  {
    field: 't46',
    source: { type: 'manual', fieldId: 'refund_bank_account' },
  },

  // Date of application (today)
  {
    field: 't47',
    source: { type: 'computed', fn: () => {
      const d = new Date();
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    }},
  },
];
