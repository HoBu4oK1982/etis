"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PartnerBrand } from "@/lib/types/home";
import { normalizeImageUrl } from "@/lib/utils/image";
import "./partners-carousel.css";

type Props = {
  partners: PartnerBrand[];
  /**
   * Скорость прокрутки в пикселях в секунду.
   * По умолчанию 45px/s — комфортно читаемо, не мельтешит.
   */
  speed?: number;
};

/**
 * Бесконечная карусель официальных партнёров.
 *
 * Реализация «marquee»: список брендов дублируется дважды в одном
 * flex-треке. Первая половина плавно уезжает влево на свою ширину
 * (translateX -50%), в момент когда вторая половина заняла её место —
 * трек мгновенно возвращается в 0. Пользователь видит непрерывное
 * движение без стыков.
 *
 * Почему не CSS-`animation`: длительность цикла зависит от суммарной
 * ширины треков, а она разная на разных экранах и меняется при resize.
 * Считаем её из фактической ширины трека и гоним трек через rAF.
 *
 * Пауза:
 *   - hover / focus внутри — стандартное поведение карусели логотипов
 *   - когда секция за пределами вьюпорта — IntersectionObserver
 *   - когда вкладка в фоне — visibilitychange
 * Так экономим CPU и батарею.
 */
export function PartnersCarousel({ partners, speed = 45 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabActive, setTabActive] = useState(true);

  const items = partners.filter((p) => Boolean(p.image));

  // Замер половины ширины трека — дистанции одного цикла.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      // Список дублирован ×2, поэтому половина ширины — это длина
      // одного полного набора логотипов. Именно на неё и уезжаем.
      halfWidthRef.current = track.scrollWidth / 2;
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [items.length]);

  // Ставим на паузу, когда секция вне вьюпорта — незачем крутить
  // невидимый DOM и триггерить лишние layout-события.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      { rootMargin: "80px" }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // И когда вкладка в фоне — тоже.
  useEffect(() => {
    const onVis = () => setTabActive(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Основной rAF-цикл.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const running = !paused && inView && tabActive && items.length > 0;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!running || reduced) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }

    const step = (ts: number) => {
      if (lastTsRef.current === null) {
        lastTsRef.current = ts;
      }
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      offsetRef.current += speed * dt;

      const half = halfWidthRef.current;
      if (half > 0 && offsetRef.current >= half) {
        // Мгновенно возвращаемся в начало — рендер идентичный,
        // потому что второй набор логотипов такой же.
        offsetRef.current -= half;
      }

      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [paused, inView, tabActive, speed, items.length]);

  if (items.length === 0) return null;

  // touch на мобильных = «клик», а не hover — не хочется, чтобы простое
  // касание пальцем ставило карусель на паузу. Слушаем только mouse-события.
  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") setPaused(true);
  };
  const onLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") setPaused(false);
  };

  return (
    <div
      ref={rootRef}
      className="etis-partners"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-label="Официальные партнёры"
    >
      <div className="etis-partners__track" ref={trackRef}>
        {[...items, ...items].map((partner, i) => {
          const src = normalizeImageUrl(partner.image);
          if (!src) return null;

          // aria-hidden на дубликаты, чтобы скринридер не читал бренды дважды
          const isClone = i >= items.length;

          return (
            <Link
              key={`${partner.id}-${i}`}
              href={`/brands/${partner.slug}`}
              className="etis-partner"
              aria-hidden={isClone || undefined}
              tabIndex={isClone ? -1 : 0}
              title={partner.title}
            >
              <Image
                src={src}
                alt={partner.title}
                fill
                sizes="(max-width: 767px) 40vw, 200px"
                className="etis-partner__img"
              />
            </Link>
          );
        })}
      </div>

      <span className="etis-partners__fade etis-partners__fade--l" aria-hidden />
      <span className="etis-partners__fade etis-partners__fade--r" aria-hidden />
    </div>
  );
}
