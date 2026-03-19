'use client';

import { useState, useEffect, useCallback } from 'react';

const FIELDS = [
  { label: '성명', value: '홍길동' },
  { label: '국적', value: '중국' },
  { label: '여권번호', value: 'M12345678' },
  { label: '체류자격', value: 'E-7' },
  { label: '근무처', value: '(주)한국기술' },
];

type Phase = 'idle' | 'scan' | 'fill' | 'done';

export default function HeroDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [scanLine, setScanLine] = useState(0);
  const [filledCount, setFilledCount] = useState(0);

  const reset = useCallback(() => {
    setPhase('idle');
    setScanLine(0);
    setFilledCount(0);
  }, []);

  // Phase transitions
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (phase === 'idle') {
      t = setTimeout(() => setPhase('scan'), 800);
    } else if (phase === 'done') {
      t = setTimeout(reset, 3000);
    }
    return () => clearTimeout(t);
  }, [phase, reset]);

  // Scan animation
  useEffect(() => {
    if (phase !== 'scan') return;
    if (scanLine >= 100) {
      setPhase('fill');
      return;
    }
    const t = setTimeout(() => setScanLine((s) => s + 2), 20);
    return () => clearTimeout(t);
  }, [phase, scanLine]);

  // Fill fields one by one
  useEffect(() => {
    if (phase !== 'fill') return;
    if (filledCount >= FIELDS.length) {
      setPhase('done');
      return;
    }
    const t = setTimeout(() => setFilledCount((c) => c + 1), 350);
    return () => clearTimeout(t);
  }, [phase, filledCount]);

  const isActive = phase === 'fill' || phase === 'done';

  return (
    <div className="relative rounded-2xl border border-black/[0.08] bg-white shadow-xl shadow-black/[0.05]">
      <div className="grid grid-cols-2">
        {/* Left: 서류 스캔 영역 */}
        <div className="relative border-r border-black/[0.06] p-4 md:p-5">
          <div className="mb-3 text-[11px] font-semibold tracking-wide text-black/30">원본 서류</div>

          {/* 여권 카드 */}
          <div className="relative overflow-hidden rounded-xl border border-black/[0.08] bg-gradient-to-br from-slate-50 to-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="text-[10px] font-bold tracking-widest text-black/40">PASSPORT</span>
            </div>
            <div className="flex gap-3">
              <div className="h-14 w-11 shrink-0 rounded-md bg-primary/10" />
              <div className="flex-1 space-y-2">
                <div className="h-2 w-full rounded-full bg-black/[0.08]" />
                <div className="h-2 w-3/4 rounded-full bg-black/[0.06]" />
                <div className="h-2 w-1/2 rounded-full bg-black/[0.06]" />
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              <div className="h-1.5 w-full rounded-full bg-black/[0.04]" />
            </div>

            {phase === 'scan' && (
              <div
                className="pointer-events-none absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_2px_rgba(36,99,235,0.3)]"
                style={{ top: `${scanLine}%`, transition: 'top 20ms linear' }}
              />
            )}

            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[2px]"
                   style={{ animation: 'fadeInScale 0.3s ease-out' }}>
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs font-semibold text-green-600">인식 완료</span>
                </div>
              </div>
            )}
          </div>

          {/* 재직증명서 */}
          <div className="relative mt-3 overflow-hidden rounded-xl border border-black/[0.06] bg-gradient-to-br from-amber-50/40 to-white p-4">
            <div className="mb-2 text-[10px] font-bold text-black/35">재직증명서</div>
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded-full bg-black/[0.06]" />
              <div className="h-2 w-2/3 rounded-full bg-black/[0.05]" />
            </div>

            {phase === 'scan' && (
              <div
                className="pointer-events-none absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_2px_rgba(36,99,235,0.3)]"
                style={{ top: `${Math.max(0, scanLine - 10)}%`, transition: 'top 20ms linear' }}
              />
            )}

            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[2px]"
                   style={{ animation: 'fadeInScale 0.3s ease-out 0.1s both' }}>
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs font-semibold text-green-600">인식 완료</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: 양식 자동 채움 */}
        <div className="p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-semibold tracking-wide text-black/30">자동 작성</div>
            {phase === 'done' && (
              <div className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-600"
                   style={{ animation: 'fadeInScale 0.3s ease-out' }}>
                완료
              </div>
            )}
          </div>

          {/* 통합신청서 헤더 */}
          <div className={`mb-4 rounded-lg border px-3 py-2 text-center transition-all duration-500 ${
            isActive ? 'border-primary/10 bg-primary/[0.03]' : 'border-black/[0.05] bg-black/[0.01]'
          }`}>
            <div className="text-[10px] text-black/30">법무부</div>
            <div className={`text-xs font-bold transition-colors ${isActive ? 'text-black/70' : 'text-black/25'}`}>통합신청서</div>
          </div>

          {/* 필드 목록 */}
          <div className="space-y-1.5">
            {FIELDS.map((field, idx) => {
              const isFilled = idx < filledCount;

              return (
                <div
                  key={field.label}
                  className="flex items-center gap-2"
                  style={isFilled ? { animation: `slideInFromRight 0.3s ease-out ${idx * 0.05}s both` } : undefined}
                >
                  <span className={`w-12 shrink-0 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-black/45' : 'text-black/20'
                  }`}>
                    {field.label}
                  </span>
                  <div className={`flex flex-1 items-center rounded-md border px-2 py-1.5 text-xs transition-all duration-300 ${
                    isFilled
                      ? 'border-primary/20 bg-primary/[0.04]'
                      : 'border-black/[0.05] bg-black/[0.02]'
                  }`}>
                    <span className={`font-semibold transition-colors ${isFilled ? 'text-primary' : 'text-black/10'}`}>
                      {isFilled ? field.value : '—'}
                    </span>
                  </div>
                  {isFilled && (
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary"
                         style={{ animation: 'fadeInScale 0.2s ease-out' }}>
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 다운로드 버튼 */}
          <div className={`mt-4 transition-all duration-500 ${phase === 'done' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}`}>
            <div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-white shadow-md shadow-primary/15">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              다운로드
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
