import type { DocumentTypeDef, Case, DocWithType } from '@/types/case';

const ALL_VISAS = ['E-7', 'D-4', 'F-5', 'D-2', 'F-6', 'F-2', 'H-2', 'C-3'];

export const documentRegistry: DocumentTypeDef[] = [
  /* ══════════════════════ 공통 외국인 서류 ══════════════════════ */
  {
    id: 'passport',
    label: '여권 사본',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명(영문)', '성별', '생년월일', '국적', '여권번호', '여권발급일', '여권만료일'],
    requiredForVisas: ALL_VISAS,
  },
  {
    id: 'id_photo',
    label: '증명사진 (3.5x4.5)',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7', 'D-2', 'F-6', 'C-3'],
  },
  {
    id: 'alien_registration',
    label: '외국인등록증 사본',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명', '외국인등록번호', '성별', '생년월일', '국적', '체류자격', '체류기간'],
    requiredForVisas: ['E-7', 'D-4', 'F-5', 'F-2', 'H-2'],
  },

  /* ══════════════════════ E-7 외국인 서류 ══════════════════════ */
  {
    id: 'degree_cert',
    label: '학위증',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명', '학교명', '학위', '전공', '졸업일자'],
    requiredForVisas: ['E-7', 'F-5', 'F-2'],
  },
  {
    id: 'graduation_cert',
    label: '졸업증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명', '학교명', '학위', '전공', '졸업일자'],
    requiredForVisas: ['E-7', 'F-2'],
  },
  {
    id: 'career_cert',
    label: '경력증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'qualification_cert',
    label: '자격증',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'resume',
    label: '이력서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'criminal_record_e7',
    label: '범죄경력증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },

  /* ══════════════════════ E-7 기업 서류 ══════════════════════ */
  {
    id: 'business_reg',
    label: '사업자등록증',
    category: 'company',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['상호', '대표자', '사업자등록번호', '사업장소재지', '업태', '종목'],
    requiredForVisas: ['E-7', 'D-4', 'F-5', 'F-2', 'H-2', 'C-3'],
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
    label: '고용계약서',
    category: 'company',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['근로자명', '직위', '계약기간', '급여', '근무지', '근무내용'],
    requiredForVisas: ['E-7', 'D-4', 'F-2'],
  },
  {
    id: 'tax_cert',
    label: '납세증명서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7', 'D-4', 'F-2'],
  },
  {
    id: 'insurance_member_list',
    label: '4대보험 가입자 명부',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'company_intro',
    label: '회사소개서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'org_chart',
    label: '조직도',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'job_description_doc',
    label: '직무기술서 (Job Description)',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'financial_statement',
    label: '재무제표',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'vat_cert',
    label: '부가가치세 과세표준증명',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['E-7'],
  },

  /* ══════════════════════ E-7 행정사 작성 서류 ══════════════════════ */
  {
    id: 'unified_application',
    label: '통합신청서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ALL_VISAS,
  },
  {
    id: 'occupation_report',
    label: '외국인 직업신고서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7', 'F-2'],
  },
  {
    id: 'employment_reason',
    label: '고용사유서',
    category: 'generated',
    source: 'ai-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'status_change_app',
    label: '체류자격 변경 신청서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7', 'F-2'],
  },
  {
    id: 'professional_recommendation',
    label: '전문인력 고용추천서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'residence_confirmation',
    label: '거주숙소 제공확인서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'stay_extension_app',
    label: '체류기간 연장 신청서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7'],
  },
  {
    id: 'visa_issuance_app',
    label: '사증발급인정서 신청서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7', 'F-6', 'C-3'],
  },

  /* ══════════════════════ F-6 한국인 배우자 서류 ══════════════════════ */
  {
    id: 'family_relation_cert',
    label: '가족관계증명서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'marriage_cert',
    label: '혼인관계증명서',
    category: 'company',
    source: 'upload',
    step: 'ocr',
    ocrFields: ['성명', '배우자성명', '혼인일자', '등록기준지'],
    requiredForVisas: ['F-6'],
  },
  {
    id: 'resident_register',
    label: '주민등록등본',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'resident_abstract',
    label: '주민등록초본',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'income_cert',
    label: '소득금액증명',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'wage_withholding',
    label: '근로소득 원천징수영수증',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'employment_cert_f6',
    label: '재직증명서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'health_insurance_cert',
    label: '건강보험 납부확인서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'housing_docs',
    label: '주거 관련 서류 (등기부등본/임대차계약서)',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },

  /* ══════════════════════ F-6 외국인 배우자 서류 ══════════════════════ */
  {
    id: 'marriage_cert_foreign',
    label: '결혼증명서 (본국 발급)',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'birth_cert',
    label: '출생증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'criminal_record',
    label: '범죄경력증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'health_exam',
    label: '건강진단서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'marriage_statement',
    label: '결혼경위서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'visa_application_form',
    label: '비자 신청서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },

  /* ══════════════════════ F-6 혼인 증빙 자료 ══════════════════════ */
  {
    id: 'wedding_photos',
    label: '결혼사진',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'family_photos',
    label: '가족사진',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'chat_records',
    label: '카카오톡 대화',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'call_records',
    label: '통화기록',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'dating_evidence',
    label: '교제 증빙',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'ceremony_photos',
    label: '결혼식 사진',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'flight_tickets',
    label: '항공권',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'entry_exit_records',
    label: '출입국 기록',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-6'],
  },

  /* ══════════════════════ F-6 행정사 작성 서류 ══════════════════════ */
  /* unified_application — 이미 위에서 F-6 포함 */
  {
    id: 'spouse_invitation',
    label: '외국인 배우자 초청장',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['F-6'],
  },
  {
    id: 'identity_guarantee',
    label: '신원보증서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['E-7', 'F-6'],
  },
  {
    id: 'marriage_background',
    label: '결혼배경진술서 정리',
    category: 'generated',
    source: 'ai-generate',
    step: 'generate',
    requiredForVisas: ['F-6'],
  },
  /* visa_issuance_app — 이미 위에서 F-6 포함 */

  /* ══════════════════════ C-3 외국인 신청인 서류 ══════════════════════ */
  /* passport, id_photo — 이미 위에서 C-3 포함 */
  {
    id: 'c3_application_form',
    label: '신청서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },
  {
    id: 'c3_employment_or_enrollment',
    label: '재직증명서 또는 재학증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },
  {
    id: 'c3_stay_purpose_docs',
    label: '체류목적 설명자료',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },
  {
    id: 'c3_financial_docs',
    label: '재정능력 입증서류',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },

  /* ══════════════════════ C-3 초청기관 서류 ══════════════════════ */
  /* business_reg — 이미 위에서 C-3 포함 */
  {
    id: 'invitation_letter',
    label: '초청장',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },
  {
    id: 'event_guide',
    label: '행사 안내문',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },
  {
    id: 'trade_contract',
    label: '거래계약서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },
  {
    id: 'visit_purpose_docs',
    label: '방문 목적 관련 자료',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['C-3'],
  },

  /* ══════════════════════ C-3 행정사 작성 서류 ══════════════════════ */
  /* visa_issuance_app — 이미 위에서 C-3 포함 */
  {
    id: 'stay_purpose_statement',
    label: '체류목적 설명서 정리',
    category: 'generated',
    source: 'ai-generate',
    step: 'generate',
    requiredForVisas: ['C-3'],
  },
  {
    id: 'invitation_reason',
    label: '초청 사유서',
    category: 'generated',
    source: 'ai-generate',
    step: 'generate',
    requiredForVisas: ['C-3'],
  },

  /* ══════════════════════ F-2 외국인 서류 ══════════════════════ */
  /* passport, alien_registration, degree_cert, graduation_cert — 이미 위에서 F-2 포함 */
  {
    id: 'income_proof_f2',
    label: '소득 증빙',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },
  {
    id: 'topik_score',
    label: 'TOPIK 성적표',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },
  {
    id: 'kiip_cert',
    label: 'KIIP 수료증',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },

  /* ══════════════════════ F-2 기업 서류 ══════════════════════ */
  /* business_reg, employment_contract, tax_cert — 이미 위에서 F-2 포함 */
  {
    id: 'employment_cert_f2',
    label: '재직증명서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },
  {
    id: 'employment_status',
    label: '고용현황 자료',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },

  /* ══════════════════════ F-2 지자체 서류 ══════════════════════ */
  {
    id: 'local_gov_recommendation',
    label: '지자체 추천서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },
  {
    id: 'local_visa_app',
    label: '지역특화비자 신청서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },
  {
    id: 'settlement_support',
    label: '정착지원 확인서',
    category: 'company',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['F-2'],
  },

  /* ══════════════════════ F-2 행정사 작성 서류 ══════════════════════ */
  /* unified_application, occupation_report, status_change_app — 이미 위에서 F-2 포함 */
  {
    id: 'local_linked_app',
    label: '지자체 추천 연계 신청서',
    category: 'generated',
    source: 'form-generate',
    step: 'generate',
    requiredForVisas: ['F-2'],
  },

  /* ══════════════════════ D-4 서류 ══════════════════════ */
  /* passport, alien_registration, business_reg, employment_contract, tax_cert — 이미 포함 */
  {
    id: 'tb_test',
    label: '결핵진단서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['D-4', 'H-2'],
  },
  {
    id: 'residence_proof',
    label: '체류지 입증서류',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['D-4', 'F-5', 'F-2', 'H-2'],
  },

  /* ══════════════════════ D-2 서류 ══════════════════════ */
  {
    id: 'transcript',
    label: '성적증명서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['D-2', 'F-5'],
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
    id: 'financial_proof',
    label: '재정입증서류 (잔고증명 등)',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['D-2'],
  },
  {
    id: 'health_cert',
    label: '건강진단서',
    category: 'foreigner',
    source: 'upload',
    step: 'upload',
    requiredForVisas: ['D-2'],
  },

  /* ══════════════════════ F-5 서류 ══════════════════════ */
  /* passport, alien_registration, degree_cert, transcript, residence_proof, business_reg 이미 포함 */
  {
    id: 'job_description',
    label: '직무기술서',
    category: 'generated',
    source: 'ai-generate',
    step: 'generate',
    requiredForVisas: ['F-5'],
  },
];

export interface VisaSubtype {
  code: string;
  label: string;
  desc: string;
  popular?: boolean;
}

export interface VisaTypeDef {
  code: string;
  label: string;
  desc: string;
  subtypes?: VisaSubtype[];
}

export const visaTypes: VisaTypeDef[] = [
  {
    code: 'F-6', label: '결혼이민', desc: '배우자 초청',
    subtypes: [
      { code: 'F-6-1', label: '국민의 배우자', desc: '', popular: true },
    ],
  },
  {
    code: 'F-2', label: '거주', desc: '장기거주',
    subtypes: [
      { code: 'F-2-R', label: '지역특화형', desc: '', popular: true },
      { code: 'F-2-7', label: '점수제', desc: '', popular: true },
    ],
  },
  {
    code: 'C-3', label: '단기방문', desc: '관광·상용·의료',
    subtypes: [
      { code: 'C-3-1', label: '일반관광', desc: '' },
      { code: 'C-3-2', label: '단체관광', desc: '' },
      { code: 'C-3-3', label: '의료관광', desc: '' },
    ],
  },
  {
    code: 'E-7', label: '특정활동', desc: '전문인력 취업',
    subtypes: [
      { code: 'E-7-1', label: '전문인력', desc: '' },
      { code: 'E-7-2', label: '준전문인력', desc: '' },
      { code: 'E-7-4', label: '숙련기능인력', desc: '' },
    ],
  },
  {
    code: 'D-4', label: '일반연수', desc: '어학연수·연수취업',
    subtypes: [
      { code: 'D-4-1', label: '어학연수', desc: '', popular: true },
      { code: 'D-4-7', label: '외국어연수', desc: '', popular: true },
    ],
  },
  {
    code: 'D-2', label: '유학', desc: '대학·대학원',
    subtypes: [
      { code: 'D-2-1', label: '전문학사', desc: '' },
    ],
  },
  {
    code: 'F-5', label: '영주', desc: '영주자격',
    subtypes: [
      { code: 'F-5-1', label: '일반영주', desc: '' },
      { code: 'F-5-2', label: '국민의 배우자', desc: '' },
      { code: 'F-5-3', label: '국민의 미성년 자녀', desc: '' },
      { code: 'F-5-4', label: '영주자격 소지자의 배우자 또는 미성년 자녀', desc: '' },
    ],
  },
];

export const applicationTypes = [
  { id: '체류자격변경허가', label: '체류자격 변경허가' },
  { id: '체류기간연장허가', label: '체류기간 연장허가' },
  { id: '체류자격부여', label: '체류자격 부여' },
  { id: '외국인등록', label: '외국인 등록' },
  { id: '등록증재발급', label: '등록증 재발급' },
  { id: '근무처변경추가', label: '근무처 변경·추가허가/신고' },
  { id: '체류지변경신고', label: '체류지 변경신고' },
  { id: '등록사항변경신고', label: '등록사항 변경신고' },
] as const;

export const visaEntityConfig: Record<string, { label: string; placeholder: string } | null> = {
  'E-7': { label: '회사명을 입력해 주세요', placeholder: '예: (주)링크비자' },
  'D-4': { label: '어학원명을 입력해 주세요', placeholder: '예: 링크대학교 어학원' },
  'D-2': { label: '학교명을 입력해 주세요', placeholder: '예: 서울대학교' },
  'C-3': { label: '초청기관명을 입력해 주세요', placeholder: '예: (주)링크비자' },
  'F-6': null,
  'F-5': null,
  'F-2': { label: '회사명을 입력해 주세요', placeholder: '예: (주)링크비자' },
};

// D-2 학생이 직접 제출해야 하는 서류 ID 목록
export const D2_STUDENT_DOC_IDS = [
  'passport',
  'id_photo',
  'transcript',
  'financial_proof',
  'health_cert',
];

export interface StudentFieldDef {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'date' | 'tel' | 'email';
  required: boolean;
}

export const D2_STUDENT_FIELDS: StudentFieldDef[] = [
  { id: 'student_name_en', label: 'Full Name (English)', placeholder: 'e.g. NGUYEN VAN A', type: 'text', required: true },
  { id: 'student_name_kr', label: '한국어 이름 (있는 경우)', placeholder: '예: 응우옌반아', type: 'text', required: false },
  { id: 'student_birth', label: '생년월일', placeholder: '', type: 'date', required: true },
  { id: 'student_nationality', label: '국적', placeholder: 'e.g. Vietnam', type: 'text', required: true },
  { id: 'student_phone', label: '연락처', placeholder: '010-0000-0000', type: 'tel', required: true },
  { id: 'student_email', label: '이메일', placeholder: 'email@example.com', type: 'email', required: true },
  { id: 'student_passport_no', label: '여권번호', placeholder: 'e.g. M12345678', type: 'text', required: true },
  { id: 'student_address_kr', label: '국내 거주지 주소', placeholder: '서울시 관악구 ...', type: 'text', required: false },
];

export function getDocumentsForVisa(visaCode: string): DocumentTypeDef[] {
  return documentRegistry.filter((d) => d.requiredForVisas.includes(visaCode));
}

export function getStudentDocuments(): DocumentTypeDef[] {
  return documentRegistry.filter((d) => D2_STUDENT_DOC_IDS.includes(d.id));
}

export function resolveDocsWithType(caseData: Case): DocWithType[] {
  return caseData.documents
    .map((cd) => {
      // Try static registry first
      const registryType = documentRegistry.find((d) => d.id === cd.typeId);
      if (registryType) {
        // If doc has a custom label override, use it
        const docType = cd.customLabel
          ? { ...registryType, label: cd.customLabel }
          : registryType;
        return { caseDoc: cd, docType };
      }
      // Fallback: build docType from the document's own fields (custom or label-edited docs)
      if (cd.customLabel) {
        const docType: DocumentTypeDef = {
          id: cd.typeId,
          label: cd.customLabel,
          category: (cd.customCategory as DocumentTypeDef['category']) ?? 'foreigner',
          source: 'upload',
          step: 'upload',
          requiredForVisas: [],
        };
        return { caseDoc: cd, docType };
      }
      return null;
    })
    .filter((d): d is DocWithType => d !== null);
}
