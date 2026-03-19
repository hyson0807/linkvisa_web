"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const signup = useAuthStore((s) => s.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({ name, email, password, passwordConfirm });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "회원가입에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="font-display mb-2 text-2xl font-bold text-text-primary">
        회원가입
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        링크비자와 함께 비자 서류를 간편하게 관리하세요
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="signup-name"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            이름
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            autoComplete="name"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            이메일
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            비밀번호
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor="signup-password-confirm"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            비밀번호 확인
          </label>
          <input
            id="signup-password-confirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="cta-btn w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        이미 계정이 있으신가요?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            로그인
          </button>
        ) : (
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            로그인
          </Link>
        )}
      </p>
    </>
  );
}
