import type { TextFieldMapping, CheckboxMapping } from './field-utils';
import { ocrFallback } from './field-utils';
import type { Case } from '@/types/case';

// ── Name ──

/** 성/명 분리 (passport → alien_registration fallback) */
export function nameSplit(surnameField: string, givenField: string): TextFieldMapping[] {
  const source = {
    type: 'computed' as const,
    fn: (c: Case) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']),
  };
  return [
    { field: surnameField, source, transform: 'split-surname' },
    { field: givenField, source, transform: 'split-given' },
  ];
}

/** 성명 단일 필드 (passport → alien_registration fallback) */
export function nameField(field: string): TextFieldMapping {
  return {
    field,
    source: {
      type: 'computed',
      fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']),
    },
  };
}

// ── Date of birth ──

/** 생년월일 3분할 (yyyy, mm, dd) */
export function dobSplit(yearField: string, monthField: string, dayField: string): TextFieldMapping[] {
  const source = {
    type: 'computed' as const,
    fn: (c: Case) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']),
  };
  return [
    { field: yearField, source, transform: 'date-yyyy' },
    { field: monthField, source, transform: 'date-mm' },
    { field: dayField, source, transform: 'date-dd' },
  ];
}

/** 생년월일 단일 필드 */
export function dobField(field: string): TextFieldMapping {
  return {
    field,
    source: {
      type: 'computed',
      fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']),
    },
  };
}

// ── Nationality ──

/** 국적 (passport → alien_registration fallback) */
export function nationality(field: string): TextFieldMapping {
  return {
    field,
    source: {
      type: 'computed',
      fn: (c) => ocrFallback(c, ['passport', '국적'], ['alien_registration', '국적']),
    },
  };
}

// ── Sex ──

function getSex(c: Case): string {
  return ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']).toUpperCase();
}

/** 성별 체크박스 (남/여) */
export function sexCheckboxes(maleField: string, femaleField: string): CheckboxMapping[] {
  return [
    { field: maleField, condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '남' || v === 'M'; } },
    { field: femaleField, condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '여' || v === 'F'; } },
  ];
}

/** 성별 텍스트 필드 (passport → alien_registration fallback) */
export function sexField(field: string): TextFieldMapping {
  return {
    field,
    source: {
      type: 'computed',
      fn: (c) => ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']),
    },
  };
}

// ── Alien registration number ──

/** 외국인등록번호 13자리 분할 */
export function alienRegDigits(fieldFn: (i: number) => string): TextFieldMapping[] {
  return Array.from({ length: 13 }, (_, i) => ({
    field: fieldFn(i),
    source: { type: 'ocr' as const, docType: 'alien_registration', key: '외국인등록번호' },
    transform: 'alien-reg-digit' as const,
    digitIndex: i,
  }));
}

/** 외국인등록번호 단일 필드 */
export function alienRegField(field: string): TextFieldMapping {
  return { field, source: { type: 'ocr', docType: 'alien_registration', key: '외국인등록번호' } };
}

// ── Current date ──

/** 신청일 3분할 (현재 날짜 기준) */
export function currentDateSplit(yearField: string, monthField: string, dayField: string): TextFieldMapping[] {
  return [
    { field: yearField, source: { type: 'computed', fn: () => String(new Date().getFullYear()) } },
    { field: monthField, source: { type: 'computed', fn: () => String(new Date().getMonth() + 1).padStart(2, '0') } },
    { field: dayField, source: { type: 'computed', fn: () => String(new Date().getDate()).padStart(2, '0') } },
  ];
}

/** 신청일 단일 필드 (yyyy.mm.dd 형식) */
export function currentDateField(field: string): TextFieldMapping {
  return {
    field,
    source: {
      type: 'computed',
      fn: () => {
        const d = new Date();
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
      },
    },
  };
}

// ── Passport ──

/** 여권번호 */
export function passportNumber(field: string): TextFieldMapping {
  return { field, source: { type: 'ocr', docType: 'passport', key: '여권번호' } };
}

/** 여권발급일 */
export function passportIssueDate(field: string): TextFieldMapping {
  return { field, source: { type: 'ocr', docType: 'passport', key: '여권발급일' } };
}

/** 여권만료일 */
export function passportExpiryDate(field: string): TextFieldMapping {
  return { field, source: { type: 'ocr', docType: 'passport', key: '여권만료일' } };
}
