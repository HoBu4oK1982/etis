"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthShell } from "./AuthShell";
import {
  AuthError,
  getStoredToken,
  loginUser,
  saveAuth,
  type ValidationErrors,
} from "@/lib/api/auth";

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  // Если пользователь уже авторизован — на страницу входа не пускаем
  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/account");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await loginUser({ email: email.trim(), password });
      saveAuth(res.data);
      const returnTo = sessionStorage.getItem("etis-auth-return") || "/account";
      sessionStorage.removeItem("etis-auth-return");
      router.push(returnTo);
    } catch (err) {
      const e = err as AuthError;
      setError(e.message);
      if (e.errors) setFieldErrors(e.errors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      breadcrumbLabel="Вход"
      title="С возвращением"
      description="Войдите, чтобы отслеживать заказы, повторять покупки и подбирать оборудование под ваши проекты."
    >
      <div className="etis-auth__card">
        <h2 className="etis-auth__form-title">Вход</h2>
        <p className="etis-auth__form-sub">Введите e-mail и пароль от аккаунта</p>

        <form onSubmit={onSubmit} className="etis-auth__form">
          <div className="etis-auth__field">
            <label htmlFor="email">E-mail</label>
            <div className="etis-auth__input">
              <Mail size={16} strokeWidth={2.1} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            {fieldErrors.email && <div className="etis-auth__field-err">{fieldErrors.email[0]}</div>}
          </div>

          <div className="etis-auth__field">
            <div className="etis-auth__label-row">
              <label htmlFor="password">Пароль</label>
              <Link href="/forgot-password" className="etis-auth__forgot">
                Забыли?
              </Link>
            </div>
            <div className="etis-auth__input">
              <Lock size={16} strokeWidth={2.1} />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                className="etis-auth__eye"
                aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="etis-auth__field-err">{fieldErrors.password[0]}</div>
            )}
          </div>

          {error && <div className="etis-auth__error">{error}</div>}

          <button type="submit" className="etis-auth__submit" disabled={submitting}>
            <span>{submitting ? "Проверяем…" : "Войти"}</span>
          </button>
        </form>

        <div className="etis-auth__divider">
          <span>или</span>
        </div>

        <p className="etis-auth__switch">
          Ещё нет аккаунта?{" "}
          <Link href="/register" className="etis-auth__switch-link">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
