import type { Case } from '@/types/case';
import type { FormDefinition, FieldGroup } from '../form-registry';
import type { TextFieldMapping, CheckboxMapping } from '../field-utils';
import { ocrFallback } from '../field-utils';

// ── 52 occupation categories (c3-c54) ──

const OCCUPATION_CATEGORIES = [
  '관리자', '경영·회계·사무 관련직', '금융·보험 관련직', '교육 및 자연과학·사회과학 연구 관련직',
  '법률·경찰·소방·교도 관련직', '보건·의료 관련직', '사회복지 및 종교 관련직',
  '문화·예술·디자인·방송 관련직', '운전 및 운송 관련직', '영업 및 판매 관련직',
  '경비 및 청소 관련직', '미용·숙박·여행·오락·스포츠 관련직', '음식서비스 관련직',
  '건설 관련직', '기계 관련직', '재료 관련직', '화학 관련직', '섬유·의복 관련직',
  '전기·전자 관련직', '정보통신 관련직', '식품가공 관련직', '인쇄·목재·가구·공예 및 기타 설치·정비·생산직',
  '농림어업 관련직', '군인',
  '의회의원·고위공무원 및 공공단체임원', '기업고위임원', '경영지원관리자', '기타 관리자',
  '경영 관련 사무직', '회계·세무 관련 사무직', '비서 및 사무보조', '상담·안내·통계·감사 사무직',
  '금융 및 보험 관련 사무직', '무역·운송 사무직', '자연과학 관련 전문가', '인문·사회과학 관련 전문가',
  '생명과학 관련 전문가', '정보통신 관련 전문가 및 기술직', '공학 관련 전문가 및 기술직',
  '보건·의료 관련 전문가', '교육 관련 전문가', '법률 관련 전문가', '행정 관련 전문가',
  '경영·금융 관련 전문가', '문화·예술 관련 전문가', '방송·언론 관련 전문가',
  '사회서비스 관련 전문가', '경찰·소방·보안 관련 전문가', '스포츠·레크리에이션 관련 전문가',
  '식품가공 관련 전문가', '환경·에너지 관련 전문가', '군사 관련 전문가',
];

// ── Text field mappings (26) ──

const textFieldMappings: TextFieldMapping[] = [
  // 인적사항
  {
    field: 't1',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-surname',
  },
  {
    field: 't2',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
    transform: 'split-given',
  },
  { field: 't3', source: { type: 'static', value: '' } },
  {
    field: 't4',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-yyyy',
  },
  {
    field: 't5',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-mm',
  },
  {
    field: 't6',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '생년월일'], ['alien_registration', '생년월일']) },
    transform: 'date-dd',
  },
  {
    field: 't7',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '국적'], ['alien_registration', '국적']) },
  },

  // 외국인등록번호 13자리 (t8-t20)
  ...Array.from({ length: 13 }, (_, i) => ({
    field: `t${8 + i}`,
    source: { type: 'ocr' as const, docType: 'alien_registration', key: '외국인등록번호' },
    transform: 'alien-reg-digit' as const,
    digitIndex: i,
  })),

  // 직업명
  {
    field: 't21',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['employment_contract', '근무내용'], ['employment_contract', '직위']) },
  },

  // 신청일/서명
  {
    field: 't22',
    source: { type: 'computed', fn: () => String(new Date().getFullYear()) },
  },
  {
    field: 't23',
    source: { type: 'computed', fn: () => String(new Date().getMonth() + 1).padStart(2, '0') },
  },
  {
    field: 't24',
    source: { type: 'computed', fn: () => String(new Date().getDate()).padStart(2, '0') },
  },
  {
    field: 't25',
    source: { type: 'computed', fn: (c) => ocrFallback(c, ['passport', '성명(영문)'], ['alien_registration', '성명']) },
  },
  { field: 't26', source: { type: 'static', value: '' } },
];

// ── Checkbox mappings (54) ──

function getSex(c: Case): string {
  return ocrFallback(c, ['passport', '성별'], ['alien_registration', '성별']).toUpperCase();
}

const checkboxMappings: CheckboxMapping[] = [
  // c1=남, c2=여
  { field: 'c1', condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '남' || v === 'M'; } },
  { field: 'c2', condition: (c) => { const v = c.manualFields?.sex || getSex(c); return v === '여' || v === 'F'; } },
  // c3-c54: 직업분류 52개
  ...OCCUPATION_CATEGORIES.map((cat, i) => ({
    field: `c${3 + i}`,
    condition: (c: Case) => c.manualFields?.occupation_category === cat,
  })),
];

// ── Labels ──

const fieldLabels: Record<string, string> = {
  t1: '성 (Surname)',
  t2: '명 (Given name)',
  t3: '한자성명',
  t4: '생년 (yyyy)',
  t5: '생월 (mm)',
  t6: '생일 (dd)',
  t7: '국적',
  t21: '직업명',
  t22: '년',
  t23: '월',
  t24: '일',
  t25: '신청인',
  t26: '대리인',
};

// Alien registration digit fields (t8-t20)
for (let i = 0; i < 13; i++) {
  fieldLabels[`t${8 + i}`] = `외국인등록번호 (${i + 1}번째 자리)`;
}

const checkboxLabels: Record<string, string> = {
  c1: '남 (M)',
  c2: '여 (F)',
};

// c3-c54: occupation category labels
OCCUPATION_CATEGORIES.forEach((cat, i) => {
  checkboxLabels[`c${3 + i}`] = cat;
});

// ── Field groups ──

const fieldGroups: FieldGroup[] = [
  {
    id: 'personal',
    label: '인적사항',
    fields: ['t1', 't2', 't3', 't4', 't5', 't6', 't7'],
    cols: '1fr 1fr',
  },
  {
    id: 'alien_reg',
    label: '외국인등록번호',
    fields: Array.from({ length: 13 }, (_, i) => `t${8 + i}`),
  },
  {
    id: 'occupation',
    label: '직업',
    fields: ['t21'],
  },
  {
    id: 'date_sign',
    label: '신청일 / 서명',
    fields: ['t22', 't23', 't24', 't25', 't26'],
    cols: '1fr 1fr',
  },
];

// ── Page hints ──

const fieldPageHints: Record<string, number> = {};

// t1-t21, c1-c14 → page 0
for (let i = 1; i <= 21; i++) fieldPageHints[`t${i}`] = 0;
for (let i = 1; i <= 14; i++) fieldPageHints[`c${i}`] = 0;

// c15-c54 → page 1
for (let i = 15; i <= 54; i++) fieldPageHints[`c${i}`] = 1;

// t22-t26 → page 2
for (let i = 22; i <= 26; i++) fieldPageHints[`t${i}`] = 2;

// ── FormDefinition ──

export const occupationReportForm: FormDefinition = {
  id: 'occupation_report',
  label: '외국인 직업신고서',
  templatePath: '/forms/occupation_report.pdf',
  textFieldMappings,
  checkboxMappings,
  fieldPageHints,
  mustFlatten: true,
  fieldLabels,
  checkboxLabels,
  fieldGroups,
  applicableVisas: ['E-7', 'F-2'],
  buildFileName: (caseData: Case) => {
    const name = caseData.foreignerName?.replace(/\s+/g, '_') || 'applicant';
    return `직업신고서_${name}.pdf`;
  },
};
