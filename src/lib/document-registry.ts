import type { DocumentTypeDef, Case, DocWithType } from '@/types/case';

const ALL_VISAS = ['E-7', 'E-9', 'D-10', 'D-2', 'F-6', 'F-2', 'H-2'];

export const documentRegistry: DocumentTypeDef[] = [
  /* ── 외국인 서류 (업로드) ── */
  {
    id: 'passport',
    label: '여권 사본',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명(영문)', '성별', '생년월일', '국적', '여권번호', '여권만료일'],
    requiredForVisas: ALL_VISAS,
  },
  {
    id: 'alien_registration',
    label: '외국인등록증 사본',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명', '외국인등록번호', '체류자격', '체류기간'],
    requiredForVisas: ['E-7', 'E-9', 'D-10', 'F-6', 'F-2', 'H-2'],
  },
  {
    id: 'degree_cert',
    label: '학위증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명', '학교명', '학위', '전공', '졸업일자'],
    requiredForVisas: ['E-7', 'D-10'],
  },
  {
    id: 'transcript',
    label: '성적증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7', 'D-2', 'D-10'],
  },
  {
    id: 'admission_letter',
    label: '입학허가서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['D-2'],
  },
  {
    id: 'enrollment_cert',
    label: '재학증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['D-2'],
  },
  {
    id: 'tb_test',
    label: '결핵진단서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7', 'E-9', 'H-2'],
  },
  {
    id: 'residence_proof',
    label: '체류지 입증서류',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7', 'E-9', 'D-10', 'F-6', 'F-2', 'H-2'],
  },

  /* ── 사업체 서류 (업로드) ── */
  {
    id: 'business_reg',
    label: '사업자등록증',
    category: 'company',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['상호', '대표자', '사업자등록번호', '사업장소재지', '업태', '종목'],
    requiredForVisas: ALL_VISAS,
  },
  {
    id: 'corp_registry',
    label: '법인등기부등본',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'employment_contract',
    label: '고용계약서 원본 및 사본',
    category: 'company',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['근로자명', '직위', '계약기간', '급여', '근무지', '근무내용'],
    requiredForVisas: ['E-7', 'E-9'],
  },
  {
    id: 'tax_cert',
    label: '납세증명서 (국세완납)',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7', 'E-9'],
  },
  {
    id: 'local_tax_cert',
    label: '지방세 납세증명서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'financial_statement',
    label: '회사 재무제표 (또는 납부내역증명)',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'employment_insurance',
    label: '고용보험 피보험자격 취득내역',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'workplace_employment_info',
    label: '사업장고용정보현황',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'unified_application',
    label: '통합신청서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'occupation_report',
    label: '외국인 직업신고서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'identity_guarantee',
    label: '신원보증서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'residence_confirmation',
    label: '거주숙소 확인서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'employment_reason',
    label: '고용 사유서',
    category: 'generated',
    source: 'ai-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'job_description',
    label: '직무기술서',
    category: 'generated',
    source: 'ai-generate',
    step: 'generate',
    requiredForVisas: ['E-7', 'D-10'],
  },
  {
    id: 'marriage_cert',
    label: '혼인관계증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명', '배우자성명', '혼인일자', '등록기준지'],
    requiredForVisas: ['F-6'],
  },
];

export interface VisaSubtype {
  code: string;
  label: string;
  desc: string;
}

export interface VisaTypeDef {
  code: string;
  label: string;
  desc: string;
  subtypes?: VisaSubtype[];
}

export const visaTypes: VisaTypeDef[] = [
  {
    code: 'E-7', label: '특정활동', desc: '전문인력 취업',
    subtypes: [
      { code: 'E-7-1', label: '전문인력', desc: '경영·전문직·연구' },
      { code: 'E-7-2', label: '준전문인력', desc: '사무·서비스직' },
      { code: 'E-7-3', label: '일반기능인력', desc: '기능직·기술직' },
      { code: 'E-7-4', label: '숙련기능인력', desc: '점수제 (제조·건설·농업)' },
    ],
  },
  {
    code: 'E-9', label: '비전문취업', desc: '제조·건설·농축산',
    subtypes: [
      { code: 'E-9-1', label: '제조업', desc: '' },
      { code: 'E-9-2', label: '건설업', desc: '' },
      { code: 'E-9-3', label: '농업', desc: '' },
      { code: 'E-9-4', label: '어업', desc: '' },
      { code: 'E-9-5', label: '서비스업', desc: '' },
    ],
  },
  {
    code: 'D-2', label: '유학', desc: '대학·대학원',
    subtypes: [
      { code: 'D-2-1', label: '전문학사', desc: '전문대' },
      { code: 'D-2-2', label: '학사', desc: '대학교' },
      { code: 'D-2-3', label: '석사', desc: '대학원' },
      { code: 'D-2-4', label: '박사', desc: '대학원' },
      { code: 'D-2-6', label: '교환학생', desc: '' },
      { code: 'D-2-7', label: '정부초청', desc: 'KGSP' },
    ],
  },
  {
    code: 'D-10', label: '구직', desc: '구직활동·창업준비',
    subtypes: [
      { code: 'D-10-1', label: '구직', desc: '일반 구직활동' },
      { code: 'D-10-2', label: '창업준비', desc: '기술창업 준비' },
    ],
  },
  { code: 'F-2', label: '거주', desc: '장기거주',
    subtypes: [
      { code: 'F-2-1', label: '일반거주', desc: '' },
      { code: 'F-2-7', label: '점수제', desc: '우수인재 점수제' },
      { code: 'F-2-99', label: '기타거주', desc: '' },
    ],
  },
  { code: 'F-6', label: '결혼이민', desc: '배우자 초청' },
  {
    code: 'H-2', label: '방문취업', desc: '동포 취업',
    subtypes: [
      { code: 'H-2-1', label: '연고방문', desc: '장기체류자 가족' },
      { code: 'H-2-5', label: '방문취업', desc: '일반 동포' },
    ],
  },
];

export const applicationTypes = [
  { id: '외국인등록', label: '외국인 등록' },
  { id: '등록증재발급', label: '등록증 재발급' },
  { id: '체류기간연장허가', label: '체류기간 연장허가' },
  { id: '체류자격변경허가', label: '체류자격 변경허가' },
  { id: '체류자격부여', label: '체류자격 부여' },
  { id: '근무처변경추가', label: '근무처 변경·추가허가/신고' },
  { id: '체류지변경신고', label: '체류지 변경신고' },
  { id: '등록사항변경신고', label: '등록사항 변경신고' },
] as const;

export const visaEntityConfig: Record<string, { label: string; placeholder: string } | null> = {
  'E-7': { label: '회사명을 입력해 주세요', placeholder: '예: (주)링크비자' },
  'E-9': { label: '회사명을 입력해 주세요', placeholder: '예: (주)링크비자' },
  'H-2': { label: '회사명을 입력해 주세요', placeholder: '예: (주)링크비자' },
  'D-2': { label: '학교명을 입력해 주세요', placeholder: '예: 서울대학교' },
  'F-6': { label: '배우자 이름을 입력해 주세요', placeholder: '예: 김영희' },
  'D-10': null,
  'F-2': null,
};

export function getDocumentsForVisa(visaCode: string): DocumentTypeDef[] {
  return documentRegistry.filter((d) => d.requiredForVisas.includes(visaCode));
}

export function resolveDocsWithType(caseData: Case): DocWithType[] {
  const customTypes = caseData.customDocTypes ?? [];
  return caseData.documents
    .map((cd) => ({
      caseDoc: cd,
      docType: documentRegistry.find((d) => d.id === cd.typeId)
        ?? customTypes.find((d) => d.id === cd.typeId),
    }))
    .filter((d): d is DocWithType => !!d.docType);
}
