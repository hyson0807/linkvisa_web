"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="font-display mb-2 text-2xl font-bold text-text-primary">
        로그인
      </h1>
      <p className="mb-8 text-sm text-text-muted">
        비자 서류 자동화 플랫폼에 오신 것을 환영합니다
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-sm font-medium text-text-secondary"
          >
            이메일
          </label>
          <input
            id="login-email"
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
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-text-secondary"
            >
              비밀번호
            </label>
            <Link
              href="#"
              className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
            >
              비밀번호 찾기
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/60 transition-shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="cta-btn w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        아직 계정이 없으신가요?{" "}
        {onSwitchToSignup ? (
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            회원가입
          </button>
        ) : (
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            회원가입
          </Link>
        )}
      </p>
    </>
  );
}
