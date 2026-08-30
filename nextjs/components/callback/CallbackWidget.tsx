"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import gsap from "gsap";
import {
  ArrowRight,
  Check,
  Clock3,
  Headphones,
  LoaderCircle,
  Phone,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useLenis } from "@/components/providers/LenisProvider";
import {
  formatPhone,
  phoneDigits,
  phoneOnKeyDown,
} from "@/lib/utils/phone-mask";
import {
  ETIS_CALLBACK_OPEN_EVENT,
  type CallbackOpenDetail,
} from "./callback-events";
import { FloatingActionDock } from "./FloatingActionDock";
import styles from "./CallbackWidget.module.css";

type SubmitStatus = "idle" | "submitting" | "success" | "error";
type FieldErrors = { name?: string; phone?: string };

type CallbackResponse = {
  ok?: boolean;
  message?: string;
  fields?: FieldErrors;
};

const DEFAULT_ERROR =
  "Не удалось отправить заявку. Позвоните нам по номеру +7 (727) 328 05 75.";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function validateForm(name: string, phone: string): FieldErrors {
  const errors: FieldErrors = {};

  if (name.trim().length < 2) {
    errors.name = "Укажите имя — минимум 2 символа.";
  }

  if (phoneDigits(phone).length !== 11) {
    errors.phone = "Введите телефон полностью.";
  }

  return errors;
}

/**
 * Единая callback-форма ETIS.KZ.
 *
 * - слушает CustomEvent от кнопок в основной и sticky-шапке;
 * - подключает компактный floating-dock: наверх, звонок, WhatsApp и callback;
 * - отправляет заявку в Next.js route handler /api/callback;
 * - использует GSAP только для transform/opacity и полностью чистит tweens;
 * - блокирует Lenis/scroll только пока открыта модалка.
 */
export function CallbackWidget() {
  const lenis = useLenis();

  const [renderModal, setRenderModal] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [source, setSource] = useState("site");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submittedName, setSubmittedName] = useState("");

  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const successMarkRef = useRef<HTMLDivElement>(null);

  const lastFocusRef = useRef<HTMLElement | null>(null);
  const previousOverflowRef = useRef("");
  const openedAtRef = useRef(Date.now());
  const closingRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const modalTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const loopTweensRef = useRef<gsap.core.Tween[]>([]);

  const stopLoops = useCallback(() => {
    loopTweensRef.current.forEach((tween) => tween.kill());
    loopTweensRef.current = [];
  }, []);

  const unlockPage = useCallback(() => {
    document.documentElement.classList.remove("etis-callback-modal-open");
    document.body.style.overflow = previousOverflowRef.current;
    lenis?.start();
  }, [lenis]);

  const finishClose = useCallback(() => {
    stopLoops();
    requestRef.current?.abort();
    requestRef.current = null;
    closingRef.current = false;
    unlockPage();
    setRenderModal(false);

    window.requestAnimationFrame(() => {
      lastFocusRef.current?.focus?.({ preventScroll: true });
    });
  }, [stopLoops, unlockPage]);

  const closeModal = useCallback(() => {
    if (!renderModal || closingRef.current) return;
    closingRef.current = true;

    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;

    modalTimelineRef.current?.kill();
    stopLoops();

    if (!root || !panel || prefersReducedMotion()) {
      finishClose();
      return;
    }

    modalTimelineRef.current = gsap
      .timeline({ onComplete: finishClose })
      .to(panel, {
        y: 20,
        scale: 0.975,
        autoAlpha: 0,
        duration: 0.24,
        ease: "power2.in",
      })
      .to(
        backdrop,
        { autoAlpha: 0, duration: 0.22, ease: "power1.out" },
        0.04,
      )
      .to(root, { autoAlpha: 0, duration: 0.18 }, 0.08);
  }, [finishClose, renderModal, stopLoops]);

  const openModal = useCallback((nextSource = "site") => {
    if (renderModal) return;

    lastFocusRef.current = document.activeElement as HTMLElement | null;
    openedAtRef.current = Date.now();
    closingRef.current = false;
    setSource(nextSource);
    setStatus("idle");
    setMessage("");
    setFieldErrors({});
    setRenderModal(true);
  }, [renderModal]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<CallbackOpenDetail>).detail;
      openModal(detail?.source || "site");
    };

    window.addEventListener(ETIS_CALLBACK_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ETIS_CALLBACK_OPEN_EVENT, onOpen);
  }, [openModal]);

  useLayoutEffect(() => {
    if (!renderModal) return;

    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    const visual = visualRef.current;
    const content = contentRef.current;
    if (!root || !backdrop || !panel || !visual || !content) return;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("etis-callback-modal-open");
    lenis?.stop();

    const reduced = prefersReducedMotion();
    const context = gsap.context(() => {
      gsap.set(root, { autoAlpha: 1 });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(panel, {
        autoAlpha: 0,
        y: reduced ? 0 : 38,
        scale: reduced ? 1 : 0.94,
        rotateX: reduced ? 0 : 5,
        transformPerspective: 1200,
      });
      gsap.set(visual, { x: reduced ? 0 : -24, autoAlpha: 0 });
      gsap.set(content, { x: reduced ? 0 : 24, autoAlpha: 0 });
      gsap.set("[data-callback-reveal]", {
        y: reduced ? 0 : 16,
        autoAlpha: 0,
      });

      modalTimelineRef.current = gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => nameInputRef.current?.focus({ preventScroll: true }),
        })
        .to(backdrop, { autoAlpha: 1, duration: reduced ? 0.12 : 0.26 })
        .to(
          panel,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: reduced ? 0.16 : 0.58,
            ease: reduced ? "power1.out" : "power4.out",
          },
          0.03,
        )
        .to(
          [visual, content],
          {
            x: 0,
            autoAlpha: 1,
            duration: reduced ? 0.14 : 0.44,
            stagger: reduced ? 0 : 0.06,
          },
          reduced ? 0.04 : 0.18,
        )
        .to(
          "[data-callback-reveal]",
          {
            y: 0,
            autoAlpha: 1,
            duration: reduced ? 0.12 : 0.38,
            stagger: reduced ? 0 : 0.055,
          },
          reduced ? 0.08 : 0.28,
        );

      if (!reduced) {
        const orbitConfigs = [
          { selector: "[data-callback-orbit='1']", rotation: 360, duration: 5.8 },
          { selector: "[data-callback-orbit='2']", rotation: -360, duration: 8.4 },
          { selector: "[data-callback-orbit='3']", rotation: 360, duration: 11.2 },
          { selector: "[data-callback-orbit='4']", rotation: -360, duration: 14.6 },
        ];

        loopTweensRef.current = [
          ...orbitConfigs.map((item) =>
            gsap.to(item.selector, {
              rotate: `+=${item.rotation}`,
              duration: item.duration,
              repeat: -1,
              ease: "none",
            }),
          ),
          gsap.to("[data-callback-phone-core]", {
            y: -7,
            duration: 1.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }),
          gsap.to("[data-callback-pulse]", {
            scale: 1.28,
            autoAlpha: 0,
            duration: 1.75,
            repeat: -1,
            ease: "power2.out",
          }),
        ];
      }
    }, root);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]):not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      modalTimelineRef.current?.kill();
      context.revert();
      stopLoops();
    };
  }, [closeModal, lenis, renderModal, stopLoops]);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      modalTimelineRef.current?.kill();
      stopLoops();
      document.documentElement.classList.remove("etis-callback-modal-open");
      document.body.style.overflow = previousOverflowRef.current;
      lenis?.start();
    };
  }, [lenis, stopLoops]);

  const handlePhoneKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    phoneOnKeyDown(event, phone, setPhone);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const errors = validateForm(name, phone);
    setFieldErrors(errors);
    setMessage("");

    if (Object.keys(errors).length > 0) {
      const target = errors.name
        ? nameInputRef.current
        : errors.phone
          ? phoneInputRef.current
          : null;
      target?.focus();
      return;
    }

    setStatus("submitting");
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 14_000);

    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneDigits(phone),
          website,
          source,
          page:
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : "",
          startedAt: openedAtRef.current,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as CallbackResponse;

      if (!response.ok || !payload.ok) {
        setFieldErrors(payload.fields || {});
        throw new Error(payload.message || DEFAULT_ERROR);
      }

      setSubmittedName(name.trim());
      setStatus("success");
      setMessage(payload.message || "Заявка отправлена.");
      setName("");
      setPhone("");
      setWebsite("");

      window.requestAnimationFrame(() => {
        const mark = successMarkRef.current;
        if (!mark || prefersReducedMotion()) return;

        gsap.fromTo(
          mark,
          { scale: 0.55, rotate: -18, autoAlpha: 0 },
          {
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            duration: 0.52,
            ease: "back.out(2.8)",
          },
        );
        gsap.fromTo(
          mark.querySelectorAll("[data-success-particle]"),
          { scale: 0, x: 0, y: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            x: (index) => [0, 30, -28, 21, -20][index] || 0,
            y: (index) => [-30, -12, -8, 24, 22][index] || 0,
            duration: 0.48,
            stagger: 0.045,
            ease: "power3.out",
          },
        );
      });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        if (closingRef.current) return;
        setMessage("Сервер отвечает слишком долго. Повторите попытку или позвоните нам.");
      } else {
        setMessage((error as Error).message || DEFAULT_ERROR);
      }
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      requestRef.current = null;
    }
  };

  return (
    <>
      <FloatingActionDock />

      {renderModal && (
        <div ref={rootRef} className={styles.modalRoot}>
          <div
            ref={backdropRef}
            className={styles.backdrop}
            aria-hidden="true"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          />

          <section
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="etis-callback-title"
            aria-describedby="etis-callback-description"
            data-lenis-prevent
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
              aria-label="Закрыть форму"
            >
              <X size={20} />
            </button>

            <div ref={visualRef} className={styles.visualSide}>
              <div className={styles.visualGrid} aria-hidden="true" />
              <div className={styles.visualGlow} aria-hidden="true" />

              <h2 id="etis-callback-title" data-callback-reveal>
                Подберём решение
                <br />
                и перезвоним
              </h2>

              <p id="etis-callback-description" data-callback-reveal>
                Оставьте контакты — специалист уточнит задачу, проверит
                совместимость оборудования и ответит без навязчивых продаж.
              </p>

              <div className={styles.benefits} data-callback-reveal>
                <div>
                  <span><Wrench size={17} /></span>
                  <b>Инженерная консультация</b>
                </div>
                <div>
                  <span><Clock3 size={17} /></span>
                  <b>Быстрый ответ в рабочее время</b>
                </div>
                <div>
                  <span><ShieldCheck size={17} /></span>
                  <b>Контакты не передаём третьим лицам</b>
                </div>
              </div>

              <div className={styles.phoneScene} aria-hidden="true">
                <span className={styles.scenePulse} data-callback-pulse />
                <span className={styles.sceneOrbit1} data-callback-orbit="1"><i /></span>
                <span className={styles.sceneOrbit2} data-callback-orbit="2"><i /></span>
                <span className={styles.sceneOrbit3} data-callback-orbit="3"><i /></span>
                <span className={styles.sceneOrbit4} data-callback-orbit="4"><i /></span>
                <span className={styles.phoneCore} data-callback-phone-core>
                  <PhoneCall size={34} />
                </span>
              </div>
            </div>

            <div ref={contentRef} className={styles.contentSide}>
              {status !== "success" ? (
                <>
                  <div className={styles.formHeading} data-callback-reveal>
                    <span><Sparkles size={16} /> Обратный звонок</span>
                    <h3>Как к вам обратиться?</h3>
                    <p>Только имя и телефон — заполнение займёт меньше минуты.</p>
                  </div>

                  <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <label className={styles.field} data-callback-reveal>
                      <span className={styles.fieldLabel}>Ваше имя</span>
                      <span className={`${styles.inputShell} ${fieldErrors.name ? styles.inputError : ""}`}>
                        <UserRound size={19} />
                        <input
                          ref={nameInputRef}
                          value={name}
                          onChange={(event) => {
                            setName(event.target.value.slice(0, 80));
                            if (fieldErrors.name) {
                              setFieldErrors((current) => ({ ...current, name: undefined }));
                            }
                            if (status === "error") {
                              setStatus("idle");
                              setMessage("");
                            }
                          }}
                          name="name"
                          type="text"
                          placeholder="Введите ваше имя"
                          autoComplete="name"
                          maxLength={80}
                          aria-invalid={Boolean(fieldErrors.name)}
                        />
                      </span>
                      {fieldErrors.name && (
                        <small className={styles.fieldError}>{fieldErrors.name}</small>
                      )}
                    </label>

                    <label className={styles.field} data-callback-reveal>
                      <span className={styles.fieldLabel}>Номер телефона</span>
                      <span className={`${styles.inputShell} ${fieldErrors.phone ? styles.inputError : ""}`}>
                        <Phone size={19} />
                        <input
                          ref={phoneInputRef}
                          value={phone}
                          onFocus={() => {
                            if (!phone) setPhone("+7");
                          }}
                          onChange={(event) => {
                            setPhone(formatPhone(event.target.value));
                            if (fieldErrors.phone) {
                              setFieldErrors((current) => ({ ...current, phone: undefined }));
                            }
                            if (status === "error") {
                              setStatus("idle");
                              setMessage("");
                            }
                          }}
                          onKeyDown={handlePhoneKeyDown}
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          placeholder="+7 (___) ___-__-__"
                          autoComplete="tel"
                          aria-invalid={Boolean(fieldErrors.phone)}
                        />
                      </span>
                      {fieldErrors.phone && (
                        <small className={styles.fieldError}>{fieldErrors.phone}</small>
                      )}
                    </label>

                    <label className={styles.honeypot} aria-hidden="true">
                      Ваш сайт
                      <input
                        name="website"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>

                    {message && status === "error" && (
                      <div className={styles.submitError} role="alert" data-callback-reveal>
                        {message}
                      </div>
                    )}

                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={status === "submitting"}
                      data-callback-reveal
                    >
                      <span className={styles.submitSheen} aria-hidden="true" />
                      <span>
                        {status === "submitting" ? (
                          <LoaderCircle className={styles.spinner} size={20} />
                        ) : (
                          <Headphones size={20} />
                        )}
                        {status === "submitting" ? "Отправляем…" : "Перезвоните мне"}
                      </span>
                      <i><ArrowRight size={18} /></i>
                    </button>

                    <p className={styles.consent} data-callback-reveal>
                      Нажимая кнопку, вы соглашаетесь с нашей{" "}
                      <Link href="/privacy" onClick={closeModal}>
                        политикой конфиденциальности
                      </Link>.
                    </p>
                  </form>

                  <div className={styles.directCall} data-callback-reveal>
                    <span><Phone size={17} /></span>
                    <div>
                      <small>Не хотите ждать?</small>
                      <a href="tel:+77273280575">+7 (727) 328 05 75</a>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.success} aria-live="polite">
                  <div ref={successMarkRef} className={styles.successMark}>
                    <span data-success-particle />
                    <span data-success-particle />
                    <span data-success-particle />
                    <span data-success-particle />
                    <span data-success-particle />
                    <Check size={34} strokeWidth={2.7} />
                  </div>
                  <span className={styles.successEyebrow}>Заявка принята</span>
                  <h3>Спасибо{submittedName ? `, ${submittedName.split(" ")[0]}` : ""}!</h3>
                  <p>
                    {message ||
                      "Менеджер ETIS получил ваши контакты и свяжется с вами в рабочее время."}
                  </p>
                  <div className={styles.successNote}>
                    <Clock3 size={19} />
                    <span>
                      <b>Звонок от специалиста</b>
                      Подготовьте краткое описание задачи или параметры объекта.
                    </span>
                  </div>
                  <button type="button" className={styles.successButton} onClick={closeModal}>
                    Готово <ArrowRight size={18} />
                  </button>
                  <a className={styles.successPhone} href="tel:+77273280575">
                    <Phone size={16} /> Позвонить сейчас
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
