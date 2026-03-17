"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import AuthModal from "@/components/auth/AuthModal";

export default function GuestSaveBanner() {
  const user = useAuthStore((s) => s.user);
  const [modalTab, setModalTab] = useState<"login" | "signup" | null>(null);

  if (user) return null;

  return (
    <>
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-amber-800">
              케이스를 안전하게 보관하세요
            </h3>
            <p className="mt-0.5 text-sm text-amber-700">
              로그인하시면 작성된 서류가 대시보드에 저장됩니다. 로그인하지 않으면 데이터가 삭제됩니다.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setModalTab("login")}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              로그인
            </button>
            <button
              onClick={() => setModalTab("signup")}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>

      {modalTab && (
        <AuthModal
          isOpen
          onClose={() => setModalTab(null)}
          initialTab={modalTab}
        />
      )}
    </>
  );
}
