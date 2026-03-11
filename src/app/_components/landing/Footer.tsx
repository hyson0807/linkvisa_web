export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <span className="text-lg font-bold text-primary/60">LinkVisa</span>
            <p className="mt-1 text-xs text-black/25">비자 서류 자동화 플랫폼</p>
          </div>
          <span className="text-sm text-black/30">contact@linkvisa.co.kr</span>
        </div>
      </div>
    </footer>
  );
}
