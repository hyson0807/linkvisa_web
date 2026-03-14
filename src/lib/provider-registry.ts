/**
 * 비자별 서류 제공 주체(Document Provider) 정의
 *
 * 각 비자마다 서류를 받아야 하는 이해관계자 구조가 다릅니다.
 * 이 레지스트리는 비자별로 Provider 그룹과 해당 서류를 매핑합니다.
 */

export type ProviderColor = 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
export type ProviderIcon = 'person' | 'building' | 'school' | 'heart' | 'couple' | 'briefcase' | 'photo' | 'gov';

export interface DocumentProvider {
  id: string;
  label: string;
  icon: ProviderIcon;
  color: ProviderColor;
  /** 이 Provider에 속하는 문서 typeId 목록 */
  docTypeIds: string[];
  /** 사용자 추가 서류 시 사용할 기본 카테고리 */
  defaultCategory: 'foreigner' | 'company';
}

export interface VisaProviderConfig {
  visaCode: string;
  providers: DocumentProvider[];
}

const visaProviderConfigs: VisaProviderConfig[] = [
  /* ── E-7 특정활동 ── */
  {
    visaCode: 'E-7',
    providers: [
      {
        id: 'e7-foreigner',
        label: '외국인 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'id_photo',
          'degree_cert',
          'graduation_cert',
          'career_cert',
          'qualification_cert',
          'resume',
          'criminal_record_e7',
          'alien_registration',
        ],
      },
      {
        id: 'e7-employer',
        label: '고용업체 서류',
        icon: 'building',
        color: 'emerald',
        defaultCategory: 'company',
        docTypeIds: [
          'business_reg',
          'corp_registry',
          'employment_contract',
          'tax_cert',
          'insurance_member_list',
          'company_intro',
          'org_chart',
          'job_description_doc',
          'financial_statement',
          'vat_cert',
        ],
      },
    ],
  },

  /* ── D-4 일반연수 ── */
  {
    visaCode: 'D-4',
    providers: [
      {
        id: 'e9-foreigner',
        label: '외국인 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'alien_registration',
          'tb_test',
          'residence_proof',
        ],
      },
      {
        id: 'e9-employer',
        label: '고용업체 서류',
        icon: 'building',
        color: 'emerald',
        defaultCategory: 'company',
        docTypeIds: [
          'business_reg',
          'employment_contract',
          'tax_cert',
        ],
      },
    ],
  },

  /* ── D-2 유학 ── */
  {
    visaCode: 'D-2',
    providers: [
      {
        id: 'd2-student',
        label: '학생 제출 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'id_photo',
          'transcript',
          'financial_proof',
          'health_cert',
        ],
      },
      {
        id: 'd2-school',
        label: '학교/행정 서류',
        icon: 'school',
        color: 'emerald',
        defaultCategory: 'company',
        docTypeIds: [
          'admission_letter',
          'enrollment_cert',
          'alien_registration',
          'business_reg',
        ],
      },
    ],
  },

  /* ── F-5 영주 ── */
  {
    visaCode: 'F-5',
    providers: [
      {
        id: 'f5-foreigner',
        label: '외국인 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'alien_registration',
          'degree_cert',
          'transcript',
          'residence_proof',
        ],
      },
      {
        id: 'f5-institution',
        label: '관련기관 서류',
        icon: 'building',
        color: 'emerald',
        defaultCategory: 'company',
        docTypeIds: [
          'business_reg',
        ],
      },
    ],
  },

  /* ── F-6 결혼이민 ── */
  {
    visaCode: 'F-6',
    providers: [
      {
        id: 'f6-korean-spouse',
        label: '한국인 배우자 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'company',
        docTypeIds: [
          'family_relation_cert',
          'marriage_cert',
          'resident_register',
          'resident_abstract',
          'income_cert',
          'wage_withholding',
          'employment_cert_f6',
          'health_insurance_cert',
          'housing_docs',
        ],
      },
      {
        id: 'f6-foreigner-spouse',
        label: '외국인 배우자 서류',
        icon: 'heart',
        color: 'rose',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'id_photo',
          'marriage_cert_foreign',
          'birth_cert',
          'criminal_record',
          'health_exam',
          'marriage_statement',
          'visa_application_form',
        ],
      },
      {
        id: 'f6-marriage-evidence',
        label: '혼인 증빙 자료',
        icon: 'photo',
        color: 'amber',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'wedding_photos',
          'family_photos',
          'chat_records',
          'call_records',
          'dating_evidence',
          'ceremony_photos',
          'flight_tickets',
          'entry_exit_records',
        ],
      },
    ],
  },

  /* ── F-2 거주 (지역특화형) ── */
  {
    visaCode: 'F-2',
    providers: [
      {
        id: 'f2-foreigner',
        label: '외국인 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'alien_registration',
          'degree_cert',
          'graduation_cert',
          'income_proof_f2',
          'residence_proof',
          'topik_score',
          'kiip_cert',
        ],
      },
      {
        id: 'f2-employer',
        label: '기업 서류',
        icon: 'building',
        color: 'emerald',
        defaultCategory: 'company',
        docTypeIds: [
          'business_reg',
          'employment_contract',
          'employment_cert_f2',
          'tax_cert',
          'employment_status',
        ],
      },
      {
        id: 'f2-local-gov',
        label: '지자체 서류',
        icon: 'gov',
        color: 'purple',
        defaultCategory: 'company',
        docTypeIds: [
          'local_gov_recommendation',
          'local_visa_app',
          'settlement_support',
        ],
      },
    ],
  },

  /* ── C-3 단기방문 ── */
  {
    visaCode: 'C-3',
    providers: [
      {
        id: 'c3-foreigner',
        label: '외국인 신청인 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'id_photo',
          'c3_application_form',
          'c3_employment_or_enrollment',
          'c3_stay_purpose_docs',
          'c3_financial_docs',
        ],
      },
      {
        id: 'c3-inviter',
        label: '초청기관 서류',
        icon: 'building',
        color: 'emerald',
        defaultCategory: 'company',
        docTypeIds: [
          'invitation_letter',
          'business_reg',
          'event_guide',
          'trade_contract',
          'visit_purpose_docs',
        ],
      },
    ],
  },

  /* ── H-2 방문취업 ── */
  {
    visaCode: 'H-2',
    providers: [
      {
        id: 'h2-foreigner',
        label: '외국인 서류',
        icon: 'person',
        color: 'blue',
        defaultCategory: 'foreigner',
        docTypeIds: [
          'passport',
          'alien_registration',
          'tb_test',
          'residence_proof',
        ],
      },
      {
        id: 'h2-employer',
        label: '고용업체 서류',
        icon: 'building',
        color: 'emerald',
        defaultCategory: 'company',
        docTypeIds: [
          'business_reg',
        ],
      },
    ],
  },
];

/** 비자 코드로 Provider 설정 조회 */
export function getProvidersForVisa(visaCode: string): DocumentProvider[] {
  const config = visaProviderConfigs.find((c) => c.visaCode === visaCode);
  return config?.providers ?? [];
}

/** 특정 비자에서 문서가 어떤 Provider에 속하는지 조회 */
export function getProviderForDoc(
  visaCode: string,
  docTypeId: string,
): DocumentProvider | undefined {
  const providers = getProvidersForVisa(visaCode);
  return providers.find((p) => p.docTypeIds.includes(docTypeId));
}

/** Provider의 색상 CSS 클래스 */
const PROVIDER_STYLES: Record<ProviderColor, { iconBg: string; iconColor: string }> = {
  blue: { iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
  emerald: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  amber: { iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  rose: { iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
  purple: { iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
  slate: { iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
};

/** Provider의 색상 CSS 클래스 반환 */
export function getProviderStyles(color: ProviderColor): {
  iconBg: string;
  iconColor: string;
} {
  return PROVIDER_STYLES[color];
}
