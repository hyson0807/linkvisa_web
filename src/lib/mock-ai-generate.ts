type TemplateInput = { context: string; manualFields?: Record<string, string> };

const templates: Record<string, (input: TemplateInput) => string> = {
  employment_reason: ({ context, manualFields }) => {
    const reason = manualFields?.application_reason || context || '고도의 기술력을 갖춘 해외 전문인력의 채용이 필요한 상황입니다.';
    const nameKr = manualFields?.applicant_name_kr || '';
    const duration = manualFields?.stay_duration || '';
    const entryDate = manualFields?.entry_date || '';

    return `고 용 사 유 서

1. 고용 외국인 인적사항
   - 성명: NGUYEN VAN A${nameKr ? ` (${nameKr})` : ''}
   - 국적: 베트남
   - 생년월일: 1990년 5월 12일
   - 체류자격: E-7 (특정활동)${entryDate ? `\n   - 입국 예정일: ${entryDate}` : ''}${duration ? `\n   - 체류 예정 기간: ${duration}` : ''}

2. 고용 사유
   당사는 소프트웨어 개발 전문기업으로서, ${reason}

   상기 외국인은 컴퓨터공학 학사 학위를 보유하고 있으며, 3년 이상의 소프트웨어 개발 실무 경험을 갖추고 있어 당사의 기술 개발 역량 강화에 크게 기여할 것으로 판단됩니다.

3. 담당 업무
   - 백엔드 시스템 설계 및 개발
   - API 설계 및 데이터베이스 관리
   - 코드 리뷰 및 기술 문서 작성

4. 국내인력 대체 불가 사유
   해당 분야의 국내 전문인력 수급이 어려우며, 상기 외국인의 전문 기술력과 글로벌 프로젝트 경험은 국내 인력으로 대체하기 어려운 수준입니다.

위와 같은 사유로 상기 외국인의 고용이 필요함을 확인합니다.

작성일: ${new Date().toISOString().slice(0, 10)}
(주)링크비자 대표이사 김대표`;
  },

  job_description: ({ context, manualFields }) => {
    const address = manualFields?.applicant_address_kr || '서울특별시 강남구 테헤란로 123';

    return `직 무 기 술 서

1. 직무명: 소프트웨어 엔지니어 (Software Engineer)

2. 소속 부서: 기술개발본부

3. 직무 개요
   ${context || '웹 애플리케이션 및 서버 시스템의 설계, 개발, 운영을 담당하는 전문 기술직입니다.'}

4. 주요 업무
   (1) 백엔드 서비스 아키텍처 설계 및 구현
   (2) RESTful API 개발 및 최적화
   (3) 데이터베이스 설계 및 쿼리 최적화
   (4) CI/CD 파이프라인 구축 및 관리
   (5) 기술 문서 작성 및 코드 리뷰

5. 필요 자격요건
   - 학력: 컴퓨터공학 또는 관련 분야 학사 이상
   - 경력: 관련 분야 3년 이상
   - 기술: Java/Spring Boot, React, PostgreSQL, AWS
   - 언어: 영어 의사소통 가능

6. 근무 조건
   - 근무지: ${address}
   - 근무시간: 주 5일, 09:00~18:00
   - 급여: 연봉 48,000,000원

작성일: ${new Date().toISOString().slice(0, 10)}
(주)링크비자`;
  },
};

export function runMockAiGenerate(
  documentTypeId: string,
  context: string,
  manualFields?: Record<string, string>
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template = templates[documentTypeId];
      resolve(
        template
          ? template({ context, manualFields })
          : `[${documentTypeId}] 문서가 생성되었습니다.\n\n${context}`
      );
    }, 2000);
  });
}
