import type { Case } from '@/types/case';
import { documentRegistry } from '../document-registry';

// ── Source types ──

export type FieldSource =
  | { type: 'ocr'; docType: string; key: string }
  | { type: 'manual'; fieldId: string }
  | { type: 'case'; key: keyof Case }
  | { type: 'static'; value: string }
  | { type: 'computed'; fn: (c: Case) => string };

export type Transform =
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
export function ocrFallback(c: Case, ...sources: [docType: string, key: string][]): string {
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

export function splitName(fullName: string): { surname: string; given: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { surname: fullName.trim(), given: '' };
  return { surname: parts[0], given: parts.slice(1).join(' ') };
}

const MONTH_NAMES: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

export function parseDate(dateStr: string): { yyyy: string; mm: string; dd: string } | null {
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

// ── Describe source for UI ──

export function getDocTypeLabel(typeId: string): string {
  return documentRegistry.find((d) => d.id === typeId)?.label ?? typeId;
}

export function describeSource(source: FieldSource): string {
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
