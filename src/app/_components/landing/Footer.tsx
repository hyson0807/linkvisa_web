import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 브랜드 영역 */}
          <div>
            <span className="text-lg font-bold text-primary/60">LinkVisa</span>
            <p className="mt-1 text-sm text-black/25">비자 서류 자동화 플랫폼</p>
          </div>

          {/* 서비스 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-black/50">서비스</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/cases/new"
                  className="text-sm text-black/40 hover:text-black/70"
                >
                  무료로 시작하기
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-black/40 hover:text-black/70"
                >
                  로그인
                </Link>
              </li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="text-sm font-semibold text-black/50">회사 정보</h3>
            <ul className="mt-3 space-y-2">
              <li className="text-sm text-black/40">welkit</li>
              <li>
                <a
                  href="https://naver.me/xf1dVSg9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-black/40 hover:text-black/70"
                >
                  경기 수원시 영통구 광교중앙로248번길 7-3 6층 68호
                </a>
              </li>
              <li className="text-sm text-black/40">contact@linkvisa.co.kr</li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-10 border-t border-black/[0.06] pt-6">
          <p className="text-center text-xs text-black/25">
            © 2026 welkit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
