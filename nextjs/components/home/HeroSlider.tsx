"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  Snowflake,
  Droplet,
  Wrench,
  PencilRuler,
  Cog,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types/category";
import type { Slider } from "@/lib/types/misc";
import { normalizeImageUrl } from "@/lib/utils/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CategoryArrowIcon,
  ConsultationIcon,
  ProjectSelectionIcon,
} from "@/components/icons";
import { SwipeHint } from "@/components/ui/SwipeHint";

/**
 * Подбирает подходящую иконку по смыслу категории —
 * работает как fallback, когда в БД у категории нет image.
 * Регэксп ловит и русские, и английские, и транслит-варианты.
 */
function pickCategoryIcon(category: Category): LucideIcon {
  const key = `${category.slug ?? ""} ${category.title ?? ""}`.toLowerCase();
  if (/отопл|kotel|kotly|kotl|heat|thermo|тепл|радиатор|котел|котёл/.test(key)) return Flame;
  if (/холод|cool|cold|klimat|кондиц|split|frost|чиллер|фанкойл|снежин/.test(key)) return Snowflake;
  if (/вод[аоеу]|water|насос|pump|pipe|труб|аква|водосн/.test(key)) return Droplet;
  if (/услуг|serv|монтаж|install|наладк|обслуж/.test(key)) return Wrench;
  if (/проект|design|инжинир|черт/.test(key)) return PencilRuler;
  if (/компл|аксес|part|фитинг|автомат|датчик|клапан/.test(key)) return Cog;
  return Package;
}

type HeroSliderProps = {
  slides: Slider[];
  categories: Category[];
};

export function HeroSlider({ slides, categories }: HeroSliderProps) {
  const visibleSlides = useMemo(() => slides.filter((slide) => Boolean(slide.image)), [slides]);
  const visibleCategories = categories.slice(0, 6);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (visibleSlides.length < 2) return;

    const intervalId = window.setInterval(() => {
      setCurrent((index) => (index + 1) % visibleSlides.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [visibleSlides.length]);

  useEffect(() => {
    if (current >= visibleSlides.length) setCurrent(0);
  }, [current, visibleSlides.length]);

  const activeSlide = visibleSlides[current];

  if (!activeSlide) {
    return <HeroFallback categories={visibleCategories} />;
  }

  const goPrevious = () => {
    setCurrent((index) => (index - 1 + visibleSlides.length) % visibleSlides.length);
  };

  const goNext = () => {
    setCurrent((index) => (index + 1) % visibleSlides.length);
  };

  /* ---------- Свайп на мобилке ----------
     Слайдер листается пальцем: активная точка сравнивает горизонтальное
     и вертикальное смещения — если жест явно горизонтальный и его длина
     ≥ 45px, переключаем слайд. Скролл страницы не блокируется. */
  const touchRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (visibleSlides.length < 2) return;
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY, active: true };
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchRef.current;
    if (!start.active) return;
    touchRef.current.active = false;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) < 45) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;

    if (dx < 0) goNext();
    else goPrevious();
  };

  return (
    <section className="hero-shell" aria-label="Главный слайдер">
      <div className="hero-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            className="hero-background"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.12 }}
            exit={{ opacity: 0 }}
            transition={{
              // Появление — быстрое, эффект "затухание"
              opacity: { duration: 0.65, ease: "easeOut" },
              // Zoom — медленно на всём протяжении показа слайда
              // (интервал автосмены 6.5s, добавляем небольшой запас)
              scale: { duration: 7, ease: "linear" },
            }}
          >
            <Image
              src={normalizeImageUrl(activeSlide.image) ?? ""}
              alt={activeSlide.title || "Инженерное оборудование ETC"}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 1344px"
              className="object-cover object-center"
            />
            <div className="hero-left-wash" />
            <div className="hero-bottom-wash" />
          </motion.div>
        </AnimatePresence>

        <button type="button" onClick={goPrevious} className="hero-arrow hero-arrow-left" aria-label="Предыдущий слайд">
          <ArrowLeftIcon size={18} />
        </button>

        <div className="hero-content">
          <motion.div
            key={`content-${activeSlide.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="hero-copy"
          >
            <p className="hero-eyebrow">
              {activeSlide.eyebrow ? (
                activeSlide.eyebrow
              ) : (
                <>
                  <span>ОБОРУДОВАНИЕ.</span> ИНЖИНИРИНГ. НАДЁЖНОСТЬ.
                </>
              )}
            </p>

            <h1 className="hero-title">
              {activeSlide.title ? (
                // Разрыв строки — символом \n в тексте из БД
                activeSlide.title.split(/\n/).map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))
              ) : (
                <>
                  Инженерные<br />системы нового уровня
                </>
              )}
            </h1>

            <p className="hero-subtitle">
              {activeSlide.subtitle ||
                "Отопление, кондиционирование, холодоснабжение и водоснабжение для объектов любой сложности."}
            </p>

            <div className="hero-actions">
              <Link href="/shop" scroll className="hero-primary-button">
                Перейти в каталог
                <ArrowRightIcon size={19} />
              </Link>
              <Link href="/contacts" className="hero-secondary-button">
                Получить консультацию
                <ConsultationIcon size={23} />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="hero-selection-card">
          <ProjectSelectionIcon size={37} />
          <div>
            <strong>Подбор оборудования<br />за 1 день</strong>
            <span>Индивидуальные решения<br />под ваш проект</span>
          </div>
        </div>

        {visibleSlides.length > 1 && (
          <>
            <button type="button" onClick={goNext} className="hero-arrow hero-arrow-right" aria-label="Следующий слайд">
              <ArrowRightIcon size={18} />
            </button>
            <div className="hero-dots" aria-label="Навигация по слайдам">
              {visibleSlides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.id}
                  onClick={() => setCurrent(index)}
                  className={index === current ? "is-active" : ""}
                  aria-label={`Открыть слайд ${index + 1}`}
                  aria-current={index === current ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CategoryStrip categories={visibleCategories} />
    </section>
  );
}

function CategoryStrip({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;

  return (
    <div className="hero-categories-wrap">
      {/* Небольшой намёк, что полосу можно свайпать — виден только
          на мобилке, где карточки идут в горизонтальный скролл. */}
      <SwipeHint className="hero-categories__hint" />

      <div className="hero-categories scrollbar-none">
        {categories.map((category) => {
          const imageUrl = normalizeImageUrl(category.image);
          const Icon = pickCategoryIcon(category);

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="hero-category-card"
            >
              <div className="hero-category-text">
                <h2>{category.title}</h2>
                {category.subtitle && (
                  <p className="hero-category-subtitle">{category.subtitle}</p>
                )}
                <p>
                  {category.short_description ||
                    category.description ||
                    "Оборудование и инженерные решения"}
                </p>
                <span className="hero-category-arrow" aria-hidden="true">
                  <CategoryArrowIcon size={18} />
                </span>
              </div>

              <div className="hero-category-image">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="170px"
                    className="object-contain object-bottom"
                  />
                ) : (
                  // Fallback: тематическая иконка вместо пустой заглушки.
                  // Срабатывает, когда админ ещё не загрузил картинку категории.
                  <div className="hero-category-icon" aria-hidden="true">
                    <Icon strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HeroFallback({ categories }: { categories: Category[] }) {
  return (
    <section className="hero-shell">
      <div className="hero-stage hero-stage-fallback">
        <div className="hero-content">
          <div className="hero-copy">
            <p className="hero-eyebrow"><span>ОБОРУДОВАНИЕ.</span> ИНЖИНИРИНГ. НАДЁЖНОСТЬ.</p>
            <h1 className="hero-title">Инженерные<br />системы нового уровня</h1>
            <p className="hero-subtitle">Добавьте изображение слайда через API — верстка автоматически подставит его фоном.</p>
            <div className="hero-actions">
              <Link href="/shop" scroll className="hero-primary-button">Перейти в каталог <ArrowRightIcon size={19} /></Link>
              <Link href="/contacts" className="hero-secondary-button">Получить консультацию <ConsultationIcon size={23} /></Link>
            </div>
          </div>
        </div>
      </div>
      <CategoryStrip categories={categories} />
    </section>
  );
}
