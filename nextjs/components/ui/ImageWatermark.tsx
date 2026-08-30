'use client';

import { useEffect, useCallback, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  ImageWatermark                                                     */
/*  Один большой «ETIS.KZ» по центру каждой контентной картинки.      */
/*                                                                     */
/*  Пропускает:                                                        */
/*   — картинки < 60 px (иконки, аватары)                             */
/*   — SVG-источники                                                   */
/*   — элементы внутри header / footer / nav                           */
/*   — элементы с атрибутом  data-no-watermark                         */
/* ------------------------------------------------------------------ */

const WM_ATTR = 'data-wm-done';
const MIN_DIM = 60;

/* ---------- SVG — один крупный водяной знак ---------- */
const watermarkSvg = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="250" viewBox="0 0 600 250">',
  // тень (+1,+1)
  '<text x="301" y="126" text-anchor="middle" dominant-baseline="central" ',
  'transform="rotate(-25 300 125)" ',
  'font-family="Arial,Helvetica,sans-serif" font-size="80" font-weight="900" ',
  'letter-spacing="12" fill="rgba(0,0,0,0.15)">ETIS.KZ</text>',
  // основной — белый
  '<text x="300" y="125" text-anchor="middle" dominant-baseline="central" ',
  'transform="rotate(-25 300 125)" ',
  'font-family="Arial,Helvetica,sans-serif" font-size="80" font-weight="900" ',
  'letter-spacing="12" fill="rgba(255,255,255,0.28)">ETIS.KZ</text>',
  '</svg>',
].join('');

const bgImage = `url("data:image/svg+xml,${encodeURIComponent(watermarkSvg)}")`;

/* ---------- компонент ---------- */
export function ImageWatermark() {
  const seen = useRef(new WeakSet<HTMLImageElement>());

  const stamp = useCallback((img: HTMLImageElement) => {
    if (seen.current.has(img)) return;
    seen.current.add(img);

    const w = img.naturalWidth || img.offsetWidth || img.width;
    const h = img.naturalHeight || img.offsetHeight || img.height;
    if (w < MIN_DIM || h < MIN_DIM) return;

    const src = img.currentSrc || img.src || '';
    if (src.endsWith('.svg') || src.startsWith('data:image/svg')) return;

    if (img.closest('header, footer, nav, [data-no-watermark]')) return;

    const parent = img.parentElement;
    if (!parent) return;
    const pos = getComputedStyle(parent).position;
    if (pos === 'static') parent.style.position = 'relative';

    const ov = document.createElement('div');
    ov.setAttribute(WM_ATTR, '');
    ov.style.position = 'absolute';
    ov.style.inset = '0';
    ov.style.backgroundImage = bgImage;
    ov.style.backgroundRepeat = 'no-repeat';
    ov.style.backgroundPosition = 'center';
    ov.style.backgroundSize = '85% auto';
    ov.style.pointerEvents = 'none';
    ov.style.zIndex = '2';

    parent.appendChild(ov);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const run = () => {
      document.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
        if (img.complete && img.naturalWidth) {
          stamp(img);
        } else {
          img.addEventListener('load', () => stamp(img), { once: true });
        }
      });
    };

    const debouncedRun = () => {
      clearTimeout(timer);
      timer = setTimeout(run, 150);
    };

    run();

    const observer = new MutationObserver(debouncedRun);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [stamp]);

  return null;
}
