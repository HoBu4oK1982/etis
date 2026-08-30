"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { API_V1 } from "@/lib/api/config";
import type { Suggestion, SuggestProduct, SuggestResponse } from "@/lib/types/search";
import { normalizeImageUrl } from "@/lib/utils/image";
import { formatPrice } from "@/lib/utils/price";
import "./smartSearch.css";

/* ============================================================
   SmartSearch — умный live-поиск для шапки etis.kz
   - debounce ввода
   - клавиатурная навигация (↑ ↓ Enter Esc)
   - подсветка совпадений
   - исправление опечаток («возможно вы искали»)
   - параллельный запуск двух вариантов запроса (оригинал + раскладка)
   - fire-and-forget логирование кликов и "нет результата"
   - GSAP-анимации open/close + stagger
   ============================================================ */

type SuggestData = SuggestResponse;

/* ---------- Раскладка EN → RU ---------- */

const EN_TO_RU: Record<string, string> = {
  q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш", o: "щ", p: "з",
  "[": "х", "]": "ъ",
  a: "ф", s: "ы", d: "в", f: "а", g: "п", h: "р", j: "о", k: "л", l: "д",
  ";": "ж", "'": "э",
  z: "я", x: "ч", c: "с", v: "м", b: "и", n: "т", m: "ь",
  ",": "б", ".": "ю", "`": "ё",
};

function fixLayoutEnToRu(value: string): string {
  return value
    .toLowerCase()
    .split("")
    .map((c) => EN_TO_RU[c] || c)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function buildQueryVariants(query: string): string[] {
  const variants: string[] = [];
  const push = (v: string) => {
    const clean = v.trim();
    if (clean && !variants.includes(clean)) variants.push(clean);
  };
  push(query);
  // Пользователь хотел набрать русское, но клавиатура была на EN: rjnky → котлы
  if (/[a-z`[\];',.]/i.test(query) && !/[а-яё]/i.test(query)) {
    push(fixLayoutEnToRu(query));
  }
  return variants;
}

/* ---------- Подсветка совпадений ---------- */

function escapeRegExp(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightTerms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[«»"'()]/g, " ")
    .split(/[\s-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length)
    .filter((t, i, a) => a.indexOf(t) === i);
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const terms = highlightTerms(query);
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = String(text).split(re);
  return (
    <>
      {parts.map((part, idx) =>
        terms.includes(part.toLowerCase()) ? (
          <mark className="ss__mark" key={idx}>{part}</mark>
        ) : (
          <span key={idx}>{part}</span>
        ),
      )}
    </>
  );
}

/* ---------- Хелперы ---------- */

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    signal,
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Search API error: ${res.status}`);
  return res.json();
}

function normalizeSuggestResponse(json: unknown, query: string): SuggestData {
  const obj = (json && typeof json === "object" ? json : {}) as Record<string, unknown>;
  const suggestions: Suggestion[] = Array.isArray(obj.suggestions)
    ? (obj.suggestions as unknown[])
        .map((item) => {
          const s = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
          return {
            text: String(s.text ?? s.title ?? ""),
            type: String(s.type ?? "product"),
            url: String(s.url ?? ""),
            score: typeof s.score === "number" ? s.score : undefined,
          } as Suggestion;
        })
        .filter((s) => s.text && s.url)
    : [];

  const products: SuggestProduct[] = Array.isArray(obj.products)
    ? (obj.products as unknown[])
        .map((item) => {
          const p = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
          if (!p.title || !p.url) return null;
          return {
            id: Number(p.id ?? 0),
            type: String(p.type ?? "product"),
            title: String(p.title),
            url: String(p.url),
            image: (p.image as string | null) ?? null,
            price: (p.price as number | null) ?? null,
            currency: (p.currency as string | null) ?? null,
            score: typeof p.score === "number" ? p.score : 0,
            match: (p.match as SuggestProduct["match"]) ?? undefined,
          } as SuggestProduct;
        })
        .filter((p): p is SuggestProduct => p !== null)
    : [];

  return {
    query: String(obj.query ?? query),
    corrected: (obj.corrected as SuggestData["corrected"]) ?? null,
    suggestions,
    products,
    popular: Array.isArray(obj.popular) ? (obj.popular as string[]) : [],
  };
}

function hasSmartResults(d: SuggestData): boolean {
  return d.suggestions.length > 0 || d.products.length > 0;
}

const SUGGEST_MIN_SCORE = 1;

function filterByMinScore(d: SuggestData): SuggestData {
  return {
    ...d,
    suggestions: d.suggestions.filter((s) => (s.score ?? SUGGEST_MIN_SCORE) >= SUGGEST_MIN_SCORE),
    products: d.products.filter((p) => (p.score ?? SUGGEST_MIN_SCORE) >= SUGGEST_MIN_SCORE),
  };
}

/* ---------- Метки типов ---------- */

const TYPE_LABEL: Record<string, string> = {
  category: "Категория",
  brand: "Бренд",
  article: "Статья",
};

/* ============================================================
   Компонент
   ============================================================ */

export default function SmartSearch({
  placeholder = "Что вы ищете? Котёл, радиатор, сплит-система…",
  onNavigate,
}: {
  placeholder?: string;
  /** Вызывается при переходе (клик/Enter/«Показать все»). Нужен для мобильного оверлея. */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SuggestData | null>(null);
  const [active, setActive] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const reportedRef = useRef<Set<string>>(new Set());

  const sections = (data?.suggestions || []).filter((s) => s.type !== "product").slice(0, 5);
  const products = (data?.products || []).slice(0, 6);
  const popular = data?.popular || [];
  const corrected =
    data?.corrected?.query && data.corrected.query !== q ? data.corrected.query : null;

  type NavItem = { href: string; type?: string; id?: number; label: string };
  const nav: NavItem[] = [];
  products.forEach((p) =>
    nav.push({ href: p.url, type: "product", id: p.id, label: p.title }),
  );
  sections.forEach((s) => nav.push({ href: s.url, type: s.type, label: s.text }));
  const hasResults = nav.length > 0;

  /* ---------- Загрузка данных ---------- */

  const fetchData = useCallback(async (query: string) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const trimmed = query.trim();

    setLoading(true);
    try {
      if (trimmed.length < 2) {
        try {
          const json = await fetchJson<{ data: string[] }>(
            `${API_V1}/search/popular`,
            ac.signal,
          );
          setData({
            query,
            corrected: null,
            suggestions: [],
            products: [],
            popular: Array.isArray(json?.data) ? json.data : [],
          });
        } catch {
          setData({ query, corrected: null, suggestions: [], products: [], popular: [] });
        }
        return;
      }

      const variants = buildQueryVariants(trimmed);
      for (const variant of variants) {
        try {
          const json = await fetchJson<unknown>(
            `${API_V1}/search/suggest?q=${encodeURIComponent(variant)}&limit=8`,
            ac.signal,
          );
          const normalized = filterByMinScore(normalizeSuggestResponse(json, variant));
          const withCorrection: SuggestData =
            variant !== trimmed && hasSmartResults(normalized)
              ? { ...normalized, query: trimmed, corrected: { query: variant } }
              : normalized;

          if (hasSmartResults(withCorrection)) {
            setData(withCorrection);
            return;
          }
        } catch (e) {
          if ((e as Error).name === "AbortError") return;
        }
      }

      setData({ query: trimmed, corrected: null, suggestions: [], products: [], popular: [] });
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setData({ query: trimmed, corrected: null, suggestions: [], products: [], popular: [] });
      }
    } finally {
      if (abortRef.current === ac) setLoading(false);
    }
  }, []);

  /* ---------- Debounce ---------- */

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => fetchData(q), 180);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, open, fetchData]);

  /* ---------- GSAP: open/close ---------- */

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (open) {
      gsap.killTweensOf(panel);
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: -10, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" },
      );
    } else {
      gsap.to(panel, { autoAlpha: 0, y: -8, duration: 0.2, ease: "power2.in" });
    }
  }, [open]);

  /* ---------- GSAP: stagger результатов ---------- */

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const items = panelRef.current.querySelectorAll(".ss__item, .ss__chip");
    if (items.length) {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.03, ease: "power2.out" },
      );
    }
    setActive(-1);
  }, [data, open]);

  /* ---------- Лог «нет результата» ---------- */

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2 || loading || hasResults || corrected || !data) return;
    if ((data.query || "").trim() !== query) return;

    const key = query.toLowerCase();
    if (reportedRef.current.has(key)) return;
    reportedRef.current.add(key);

    fetch(`${API_V1}/search/no-results`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
    }).catch(() => {});
  }, [data, loading, hasResults, corrected, q]);

  /* ---------- Клики вне + Escape ---------- */

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* ---------- Переходы ---------- */

  const go = (href: string, type?: string, id?: number) => {
    if (q.trim()) {
      fetch(`${API_V1}/search/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: q, type, id }),
      }).catch(() => {});
    }
    setOpen(false);
    router.push(href);
    onNavigate?.();
  };

  const goAll = () => {
    const query = (corrected || q).trim();
    if (!query) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onNavigate?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, nav.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && nav[active]) go(nav[active].href, nav[active].type, nav[active].id);
      else goAll();
    }
  };

  let idx = -1;

  return (
    <div className="ss" ref={rootRef}>
      <div className={`ss__field ${open ? "is-open" : ""}`}>
        <button
          type="button"
          className="ss__iconBtn"
          aria-label="Найти"
          onClick={() => {
            if (q.trim().length >= 2) goAll();
            else inputRef.current?.focus();
          }}
        >
          <svg className="ss__icon" viewBox="0 0 512 512" aria-hidden>
            <path
              fill="currentColor"
              d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          className="ss__input"
          type="text"
          value={q}
          placeholder={placeholder}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          aria-label={placeholder}
        />
        {q && (
          <button
            className="ss__clear"
            onClick={() => {
              setQ("");
              inputRef.current?.focus();
            }}
            aria-label="Очистить"
            type="button"
          >
            ×
          </button>
        )}
        <span className={`ss__bar ${loading ? "is-loading" : ""}`} />
      </div>

      {open && (
        <div className="ss__panel" ref={panelRef}>
          {corrected && (
            <button
              className="ss__corrected"
              type="button"
              onClick={() => {
                setQ(corrected);
                inputRef.current?.focus();
              }}
            >
              Возможно, вы искали: <b>{corrected}</b>
            </button>
          )}

          {q.trim().length < 2 && popular.length > 0 && (
            <div className="ss__group">
              <div className="ss__groupTitle">Популярные запросы</div>
              <div className="ss__chips">
                {popular.map((p, i) => (
                  <button
                    key={i}
                    className="ss__chip"
                    type="button"
                    onClick={() => {
                      setQ(p);
                      inputRef.current?.focus();
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {products.length > 0 && (
            <div className="ss__group">
              <div className="ss__groupTitle">Товары</div>
              {products.map((p) => {
                idx++;
                const curr = idx;
                return (
                  <button
                    key={`p${p.id}`}
                    type="button"
                    className={`ss__item ss__prod ${active === curr ? "is-active" : ""}`}
                    onMouseEnter={() => setActive(curr)}
                    onClick={() => go(p.url, "product", p.id)}
                  >
                    <span className="ss__thumb">
                      {(() => {
                        const src = normalizeImageUrl(p.image);
                        return src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            onError={(e) =>
                              ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")
                            }
                          />
                        ) : (
                          <span className="ss__thumbPh" />
                        );
                      })()}
                    </span>
                    <span className="ss__prodTitle">
                      <HighlightText text={p.title} query={corrected || q} />
                    </span>
                    {p.price ? (
                      <span className="ss__prodPrice">
                        {formatPrice(p.price)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}

          {sections.length > 0 && (
            <div className="ss__group">
              <div className="ss__groupTitle">Категории, бренды, статьи</div>
              {sections.map((s, i) => {
                idx++;
                const curr = idx;
                return (
                  <button
                    key={`s${i}`}
                    type="button"
                    className={`ss__item ss__sec ${active === curr ? "is-active" : ""}`}
                    onMouseEnter={() => setActive(curr)}
                    onClick={() => go(s.url, s.type)}
                  >
                    <span className="ss__secIco" aria-hidden>›</span>
                    <span className="ss__secText">
                      <HighlightText text={s.text} query={corrected || q} />
                    </span>
                    <span className="ss__secType">{TYPE_LABEL[s.type] || "Раздел"}</span>
                  </button>
                );
              })}
            </div>
          )}

          {q.trim().length >= 2 && !loading && !hasResults && (
            <div className="ss__empty">Ничего не найдено по «{q}»</div>
          )}

          {q.trim().length >= 2 && (
            <button className="ss__all" type="button" onClick={goAll}>
              Показать все результаты по «{q.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  );
}
