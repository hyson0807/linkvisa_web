'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface WizardLayoutProps {
  step: number;
  totalSteps: number;
  direction: 'forward' | 'backward';
  onBack: () => void;
  children: React.ReactNode;
}

export default function WizardLayout({ step, totalSteps, direction, onBack, children }: WizardLayoutProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const animationClass = direction === 'forward'
    ? 'animate-[slideInFromRight_0.3s_ease-out]'
    : 'animate-[slideInFromLeft_0.3s_ease-out]';

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* 상단 네비게이션 */}
      <nav className="flex items-center justify-between px-6 py-4">
        {step === 1 ? (
          <div />
        ) : (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-black/40 transition-colors hover:text-black/70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            이전
          </button>
        )}

        {/* 진행 도트 */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'bg-primary' : 'bg-black/10'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => router.push(user ? '/dashboard' : '/')}
          className="text-sm font-medium text-black/30 transition-colors hover:text-black/60"
        >
          나가기
        </button>
      </nav>

      {/* 컨텐츠 영역 */}
      <main className="mx-auto max-w-lg px-6 pt-12 pb-20">
        <div key={step} className={animationClass}>
          {children}
        </div>
      </main>
    </div>
  );
}
