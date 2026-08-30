"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { AuthShell } from "./AuthShell";
import {
  AuthError,
  getStoredToken,
  registerUser,
  saveAuth,
  type ValidationErrors,
} from "@/lib/api/auth";
import {
  formatPhone,
  phoneDigits,
  phoneOnKeyDown,
} from "@/lib/utils/phone-mask";

type FormState = {
  name: string;
  phone: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms: boolean;
};

const INITIAL: FormState = {
  name: "",
  phone: "",
  email: "",
  password: "",
  password_confirmation: "",
  terms: false,
};

export function RegisterView() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (getStoredToken()) {
      router.replace("/account");
    } else {
      setChecking(false);
    }
  }, [router]);

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.email.trim().length > 3 &&
      form.password.length >= 8 &&
      form.password === form.password_confirmation &&
      phoneDigits(form.phone).length === 11 &&
      form.terms &&
      !submitting
    );
  }, [form, submitting]);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  if (checking) return null;

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    update("phone", formatPhone(e.target.value));
  };
  const onPhoneFocus = () => {
    if (!form.phone) update("phone", "+7");
  };
  const onPhoneKey = (e: KeyboardEvent<HTMLInputElement>) =>
    phoneOnKeyDown(e, form.phone, (value) => update("phone", value));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: phoneDigits(form.phone),
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      saveAuth(res.data);
      router.push("/account");
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
      breadcrumbLabel="Регистрация"
      title="Присоединяйтесь к ETC"
      description="Создайте аккаунт — и получите быстрый заказ, историю покупок и подбор инженерного оборудования под ваши объекты."
    >
      <div className="etis-auth__card">
        <h2 className="etis-auth__form-title">Создать аккаунт</h2>
        <p className="etis-auth__form-sub">Заполните форму — это займёт минуту</p>

        <form onSubmit={onSubmit} className="etis-auth__form">
          <div className="etis-auth__field">
            <label htmlFor="name">Имя</label>
            <div className="etis-auth__input">
              <User size={16} strokeWidth={2.1} />
              <input
                id="name"
                type="text"
                placeholder="Александр"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            {fieldErrors.name && <div className="etis-auth__field-err">{fieldErrors.name[0]}</div>}
          </div>

          <div className="etis-auth__row">
            <div className="etis-auth__field">
              <label htmlFor="phone">Телефон</label>
              <div className="etis-auth__input">
                <Phone size={16} strokeWidth={2.1} />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="+7 (___) ___-__-__"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={onPhoneChange}
                  onFocus={onPhoneFocus}
                  onKeyDown={onPhoneKey}
                  disabled={submitting}
                  required
                />
              </div>
              {fieldErrors.phone && (
                <div className="etis-auth__field-err">{fieldErrors.phone[0]}</div>
              )}
            </div>

            <div className="etis-auth__field">
              <label htmlFor="email">E-mail</label>
              <div className="etis-auth__input">
                <Mail size={16} strokeWidth={2.1} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
              {fieldErrors.email && (
                <div className="etis-auth__field-err">{fieldErrors.email[0]}</div>
              )}
            </div>
          </div>

          <div className="etis-auth__row">
            <div className="etis-auth__field">
              <label htmlFor="password">Пароль</label>
              <div className="etis-auth__input">
                <Lock size={16} strokeWidth={2.1} />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Минимум 8 символов"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="etis-auth__eye"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="etis-auth__field-err">{fieldErrors.password[0]}</div>
              )}
            </div>

            <div className="etis-auth__field">
              <label htmlFor="password2">Подтвердить</label>
              <div className="etis-auth__input">
                <Lock size={16} strokeWidth={2.1} />
                <input
                  id="password2"
                  type={showPw2 ? "text" : "password"}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                  value={form.password_confirmation}
                  onChange={(e) => update("password_confirmation", e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="etis-auth__eye"
                  onClick={() => setShowPw2((v) => !v)}
                  aria-label={showPw2 ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password_confirmation.length > 0 &&
                form.password_confirmation !== form.password && (
                  <div className="etis-auth__field-err">Пароли не совпадают</div>
                )}
            </div>
          </div>

          <label className="etis-auth__agree">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => update("terms", e.target.checked)}
            />
            <span className="etis-auth__agree-box" />
            <span>
              Я согласен с{" "}
              <Link href="/privacy" target="_blank">
                политикой конфиденциальности
              </Link>{" "}
              и условиями обработки данных
            </span>
          </label>

          {error && <div className="etis-auth__error">{error}</div>}

          <button type="submit" className="etis-auth__submit" disabled={!canSubmit}>
            <span>{submitting ? "Создаём аккаунт…" : "Создать аккаунт"}</span>
          </button>
        </form>

        <div className="etis-auth__divider">
          <span>или</span>
        </div>

        <p className="etis-auth__switch">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="etis-auth__switch-link">
            Войти
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
