"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/lib/types/product";
import { NoPhoto } from "./NoPhoto";
import { normalizeImageUrl } from "@/lib/utils/image";

type Props = {
  images: ProductImage[];
  alt: string;
};

/**
 * Галерея карточки товара. Стрелки листания, миниатюры внизу, GSAP
 * cross-fade между слайдами. Работает и с одной картинкой (без стрелок).
 * Без картинок — плейсхолдер.
 */
export function ProductGallery({ images, alt }: Props) {
  const list = images
    .map((im) => ({ id: im.id, url: normalizeImageUrl(im.url) }))
    .filter((im): im is { id: number; url: string } => Boolean(im.url));

  const [idx, setIdx] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (!slideRef.current) return;
    gsap.fromTo(
      slideRef.current,
      { autoAlpha: 0, scale: 0.98 },
      { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power2.out" }
    );
  }, [idx]);

  if (list.length === 0) {
    return (
      <div className="etis-gallery">
        <div className="etis-gallery__stage">
          <div className="etis-gallery__slide">
            <NoPhoto size={140} />
          </div>
        </div>
      </div>
    );
  }

  const active = list[idx];

  const go = (delta: number) => {
    setIdx((i) => (i + delta + list.length) % list.length);
  };

  return (
    <div className="etis-gallery">
      <div ref={stageRef} className="etis-gallery__stage">
        <div ref={slideRef} className="etis-gallery__slide" key={active.id}>
          <Image
            src={active.url}
            alt={alt}
            fill
            sizes="(max-width: 900px) 100vw, 700px"
            className="object-contain"
            priority
          />
        </div>

        {list.length > 1 && (
          <>
            <button
              type="button"
              className="etis-gallery__nav etis-gallery__nav--prev"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="etis-gallery__nav etis-gallery__nav--next"
              onClick={() => go(1)}
              aria-label="Следующее фото"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="etis-gallery__thumbs">
          {list.map((im, i) => (
            <button
              key={im.id}
              type="button"
              className="etis-gallery__thumb"
              data-active={i === idx ? "true" : "false"}
              onClick={() => setIdx(i)}
              aria-label={`Показать фото ${i + 1}`}
            >
              <div className="relative w-full h-full">
                <Image src={im.url} alt="" fill sizes="88px" className="object-contain" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
