import type { MappedField, UnmappedField } from '@/lib/pdf/analyze';
import type { FieldGroup } from '@/lib/pdf/form-registry';
export type { FieldGroup };

// ── Field grouping definitions ──

export const ALIEN_REG_FIELDS = Array.from({ length: 13 }, (_, i) => `t${12 + i}`);

// applicationType → 신청 자격 필드 매핑
export const APP_TYPE_QUAL_FIELDS: Record<string, string[]> = {
  '체류자격변경허가': ['t1', 't2'],
  '체류자격부여': ['t3', 't4'],
  '체류자격 외 활동허가': ['t5', 't6'],
};

export const UNIFIED_FIELD_GROUPS: FieldGroup[] = [
  { id: 'name', label: '성명', fields: ['t7', 't8'], cols: '1fr 1fr' },
  { id: 'birth_sex', label: '생년월일 · 성별', fields: ['t9', 't10', 't11'], cols: '1fr 1fr 1fr' },
  { id: 'alien_reg', label: '외국인등록번호', fields: ALIEN_REG_FIELDS },
  { id: 'nationality', label: '국적', fields: ['t25'] },
  { id: 'passport', label: '여권 정보', fields: ['t26', 't27', 't28'], cols: '1fr 1fr 1fr' },
  { id: 'contact_kr', label: '연락처 (국내)', fields: ['t29', 't30', 't31'], cols: '2fr 1fr 1fr' },
  { id: 'contact_home', label: '연락처 (본국)', fields: ['t32', 't33'], cols: '2fr 1fr' },
  { id: 'school', label: '학교 정보', fields: ['t34', 't35'], cols: '2fr 1fr' },
  { id: 'prev_work', label: '원 근무처', fields: ['t36', 't37', 't38'], cols: '1fr 1fr 1fr' },
  { id: 'next_work', label: '예정 근무처', fields: ['t39', 't40', 't41'], cols: '1fr 1fr 1fr' },
  { id: 'income', label: '소득 · 직업', fields: ['t42', 't43'], cols: '1fr 1fr' },
  { id: 'etc', label: '기타', fields: ['t44', 't45', 't46', 't47'], cols: '1fr 1fr' },
];

// ── Types ──

export type AnyField = (MappedField | UnmappedField) & { isMapped: boolean };

/** Get the default/fallback value for a field (mapped value or empty string) */
export function getDefaultValue(f: AnyField): string {
  return f.isMapped ? (f as MappedField).value : '';
}

// ── Shared input class for mapping fields ──

export const MAPPING_INPUT_CLASS =
  'w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-black/70 placeholder:text-black/20 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30';

// ── Select options ──

export const SEX_OPTIONS = [
  { value: '', label: '선택' },
  { value: '남', label: '남 (M)' },
  { value: '여', label: '여 (F)' },
];

export const SCHOOL_STATUS_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '미취학', label: '미취학' },
  { value: '초', label: '초등학교' },
  { value: '중', label: '중학교' },
  { value: '고', label: '고등학교' },
];

export const SCHOOL_TYPE_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '교육청 인가', label: '교육청 인가' },
  { value: '교육청 비인가', label: '교육청 비인가' },
  { value: '대안학교', label: '대안학교' },
];
