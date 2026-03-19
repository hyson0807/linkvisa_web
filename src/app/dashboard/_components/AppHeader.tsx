'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { onSessionRefresh, refreshAccessToken } from '@/lib/api';

const ACCESS_TOKEN_LIFETIME_SECONDS = 15 * 60; // 15분
const PROACTIVE_REFRESH_SECONDS = 60; // 만료 1분 전에 선제 갱신

export default function AppHeader() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [remaining, setRemaining] = useState(ACCESS_TOKEN_LIFETIME_SECONDS);
  const refreshTriggered = useRef(false);

  const resetTimer = useCallback((remainingMs: number) => {
    setRemaining(Math.floor(remainingMs / 1000));
    refreshTriggered.current = false;
  }, []);

  // 세션 갱신 이벤트 구독 → 타이머 리셋
  useEffect(() => {
    return onSessionRefresh(resetTimer);
  }, [resetTimer]);

  // 만료 1분 전 선제적 토큰 갱신
  useEffect(() => {
    if (remaining > PROACTIVE_REFRESH_SECONDS || refreshTriggered.current) return;
    refreshTriggered.current = true;

    refreshAccessToken().then(async (ok) => {
      if (!ok) {
        await logout();
        router.push('/login');
      }
    });
  }, [remaining, logout, router]);

  // remaining > 0일 때만 카운트다운
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = remaining <= 5 * 60;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          LinkVisa
        </Link>

        <div className="flex items-center gap-4">
          <span
            className={`text-sm font-medium tabular-nums ${
              isUrgent ? 'text-red-500' : 'text-black/40'
            }`}
          >
            세션 {timeString}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-black/40 transition-colors hover:text-black/70"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
