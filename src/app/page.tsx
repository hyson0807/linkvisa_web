export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-bg-muted to-body-bg px-6 py-24 text-center">
        <span className="mb-4 inline-block rounded-full bg-bg-light px-4 py-1.5 text-sm font-medium text-primary">
          AI 기반 비자 서류 자동화
        </span>
        <h1 className="mb-6 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          복잡한 비자 서류,
          <br />
          <span className="text-primary">AI가 대신 작성합니다</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-text-secondary">
          출입국 양식 자동화, AI OCR 문서 인식, 실시간 공문서 미리보기까지.
          <br className="hidden sm:block" />
          행정사와 외국인을 위한 비자 서류처리 플랫폼.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="#"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            시작하기
          </a>
          <a
            href="#"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-8 text-base font-semibold text-primary transition-colors hover:bg-bg-light"
          >
            자세히 알아보기
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-text-muted">
        &copy; 2026 Linkvisa. All rights reserved.
      </footer>
    </div>
  );
}
