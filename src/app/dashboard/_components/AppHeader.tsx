'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const INITIAL_SESSION_SECONDS = 30 * 60; // 30분

export default function AppHeader() {
  const [remaining, setRemaining] = useState(INITIAL_SESSION_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = remaining <= 5 * 60;

  const handleLogout = () => {
    // TODO: 실제 로그아웃 로직
    window.location.href = '/';
  };

  return (
    <header className="border-b border-black/5 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold text-primary">
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
