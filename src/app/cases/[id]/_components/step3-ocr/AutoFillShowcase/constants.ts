import type { DocumentDef } from './types';

export const TIMING = {
  CHAR_SPEED: 60,
  CHAR_SPEED_VARIANCE: 30,
  FIELD_DELAY: 400,
  FIELD_START_DELAY: 800,
  PHASE_TRANSITION: 1500,
  AI_CHAR_SPEED: 35,
  AI_START_DELAY: 2000,
  COMPLETE_DELAY: 800,
  CHUNK_TRANSITION: 600,
} as const;

export const CHUNK_SIZE = 4;

export const PHASE_LABELS = [
  '통합신청서 · 외국인 직업신고서',
  '신원보증서 · 거주숙소 확인서',
  '고용사유서 · 직무기술서',
];

export const SHOWCASE_DOCUMENTS: DocumentDef[][] = [
  [
    {
      id: 'unified_application',
      title: '통합신청서',
      subtitle: 'UNIFIED APPLICATION FORM',
      icon: 'form',
      fields: [
        { label: '성명(영문)', value: 'JOHN SMITH' },
        { label: '생년월일', value: '1990-05-15' },
        { label: '국적', value: '미국' },
        { label: '여권번호', value: 'M12345678' },
        { label: '체류자격', value: 'E-7 (전문인력)' },
        { label: '초청기관명', value: '(주)테크솔루션' },
        { label: '직위', value: 'Senior Developer' },
        { label: '급여', value: '60,000,000원' },
      ],
    },
    {
      id: 'occupation_report',
      title: '외국인 직업신고서',
      subtitle: 'FOREIGNER OCCUPATION REPORT',
      icon: 'form',
      fields: [
        { label: '직업분류', value: '컴퓨터 시스템 설계 및 분석' },
        { label: '근무처 명칭', value: '(주)테크솔루션' },
        { label: '근무처 소재지', value: '서울특별시 강남구 테헤란로 123' },
      ],
    },
  ],
  [
    {
      id: 'identity_guarantee',
      title: '신원보증서',
      subtitle: 'IDENTITY GUARANTEE LETTER',
      icon: 'form',
      fields: [
        { label: '보증인 성명', value: '김대표' },
        { label: '보증인 관계', value: '고용주' },
        { label: '보증기간', value: '2024-01-01 ~ 2025-12-31' },
        { label: '보증내용', value: '체류기간 중 신원 보증' },
      ],
    },
    {
      id: 'residence_confirmation',
      title: '거주숙소 확인서',
      subtitle: 'RESIDENCE CONFIRMATION',
      icon: 'form',
      fields: [
        { label: '숙소유형', value: '원룸' },
        { label: '숙소주소', value: '서울특별시 강남구 역삼동 123-45' },
        { label: '제공자 성명', value: '박주인' },
        { label: '제공자 관계', value: '임대인' },
      ],
    },
  ],
  [
    {
      id: 'employment_reason',
      title: '고용 사유서',
      subtitle: 'AI 자동 생성',
      icon: 'ai',
      fields: [],
    },
    {
      id: 'job_description',
      title: '직무 기술서',
      subtitle: 'AI 자동 생성',
      icon: 'ai',
      fields: [],
    },
  ],
];

export const AI_CONTENT: Record<string, string> = {
  employment_reason: `1. 고용 사유

당사 (주)테크솔루션은 AI/ML 기반 솔루션을 개발하는
IT 전문 기업으로서, 글로벌 시장 진출을 위한
핵심 인력이 필요합니다.

JOHN SMITH는 미국 UC Berkeley에서
컴퓨터공학 석사학위를 취득하고,
5년간 실리콘밸리에서 AI 엔지니어로
근무한 전문 인력입니다.

국내에서 해당 분야의 전문 인력을
확보하기 어려운 상황이며,
해당 외국인의 전문 지식과 경험은
당사의 핵심 사업 성장에 필수적입니다.`,

  job_description: `직무 기술서

1. 담당 업무
   - AI/ML 모델 설계 및 개발
   - 데이터 파이프라인 구축
   - 기술 팀 리딩 및 멘토링

2. 필요 자격 요건
   - 컴퓨터공학 관련 석사 이상
   - Python, TensorFlow 전문성
   - 5년 이상 실무 경험

3. 근무 조건
   - 근무지: 서울특별시 강남구
   - 근무시간: 주 40시간
   - 연봉: 6,000만원`,
};
