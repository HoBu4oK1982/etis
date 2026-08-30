"use client";

import gsap from "gsap";

type Point = { x: number; y: number };
type TrailPoint = Point & { life: number };

/**
 * Облегчённая анимация добавления товара в корзину.
 *
 * Миниатюра стартует строго из переданного элемента (в деталях товара —
 * из кнопки «В корзину»), поэтому эффект виден даже на маленьком экране.
 * На мобильных и слабых устройствах Canvas автоматически отключается:
 * остаётся только короткий GSAP-полёт и импульс корзины.
 */
export function flyToCart(source: HTMLElement, imageSrc: string | null): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const sourceRect = source.getBoundingClientRect();
  if (sourceRect.width <= 0 || sourceRect.height <= 0) return;

  const target = findVisibleCartTarget();
  const targetRect = target?.getBoundingClientRect();
  const start: Point = {
    x: sourceRect.left + sourceRect.width / 2,
    y: sourceRect.top + sourceRect.height / 2,
  };
  const end: Point = targetRect
    ? {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2,
      }
    : {
        x: Math.max(34, window.innerWidth - 38),
        y: 38,
      };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    if (target) pulseCart(target, true);
    return;
  }

  const isMobile = window.innerWidth < 768;
  const lowPower = isLowPowerDevice(isMobile);
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const size = isMobile ? 42 : 54;
  const lift = Math.min(isMobile ? 72 : 112, Math.max(42, distance * 0.14));
  const control: Point = {
    x: start.x + (end.x - start.x) * 0.5,
    y: Math.max(18, Math.min(start.y, end.y) - lift),
  };

  const resolvedImage = resolveImageSource(source, imageSrc);
  const clone = createFlyingVisual(resolvedImage, size);
  document.body.appendChild(clone);

  const canvasScene = lowPower ? null : createCanvasScene();
  if (canvasScene) document.body.appendChild(canvasScene.canvas);

  const progress = { value: 0 };
  const trail: TrailPoint[] = [];
  let lastPoint = start;
  let lastDrawAt = 0;
  let cleaned = false;

  const updateVisual = () => {
    const point = quadraticPoint(start, control, end, progress.value);
    const scale = Math.max(0.22, 1 - progress.value * 0.78);
    const fade = progress.value > 0.8 ? 1 - (progress.value - 0.8) / 0.2 : 1;

    clone.style.transform = `translate3d(${point.x - size / 2}px, ${point.y - size / 2}px, 0) scale(${scale}) rotate(${progress.value * 150}deg)`;
    clone.style.opacity = String(Math.max(0, fade));

    if (canvasScene && Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) > 7) {
      trail.push({ x: point.x, y: point.y, life: 1 });
      if (trail.length > 10) trail.shift();
      lastPoint = point;
    }
  };

  const draw = (_time: number, deltaTime: number) => {
    if (!canvasScene) return;

    // Ограничиваем отрисовку примерно до 30 FPS даже на быстрых мониторах.
    lastDrawAt += deltaTime;
    if (lastDrawAt < 32) return;
    lastDrawAt = 0;

    const { ctx, width, height } = canvasScene;
    ctx.clearRect(0, 0, width, height);

    for (const point of trail) point.life -= 0.15;
    while (trail.length && trail[0].life <= 0) trail.shift();
    drawTrail(ctx, trail);
  };

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    gsap.ticker.remove(draw);
    clone.remove();
    canvasScene?.canvas.remove();
  };

  if (canvasScene) gsap.ticker.add(draw);
  updateVisual();

  const duration = Math.min(0.68, Math.max(0.46, distance / 1900));
  gsap.to(progress, {
    value: 1,
    duration,
    ease: "power2.inOut",
    overwrite: false,
    onUpdate: updateVisual,
    onComplete: () => {
      if (target) pulseCart(target, lowPower);
      cleanup();
    },
  });

  window.setTimeout(cleanup, 950);
}

function isLowPowerDevice(isMobile: boolean): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  return Boolean(
    isMobile ||
      nav.connection?.saveData ||
      (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) ||
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4)
  );
}

function resolveImageSource(source: HTMLElement, fallback: string | null): string | null {
  if (fallback) return fallback;
  if (source instanceof HTMLImageElement) return source.currentSrc || source.src || null;
  const image = source.querySelector<HTMLImageElement>("img");
  return image?.currentSrc || image?.src || null;
}

function createFlyingVisual(imageSrc: string | null, size: number): HTMLDivElement {
  const clone = document.createElement("div");
  clone.setAttribute("aria-hidden", "true");

  Object.assign(clone.style, {
    position: "fixed",
    inset: "0 auto auto 0",
    width: `${size}px`,
    height: `${size}px`,
    zIndex: "2147483001",
    pointerEvents: "none",
    borderRadius: `${Math.round(size * 0.24)}px`,
    overflow: "hidden",
    background: "rgba(255,255,255,.97)",
    border: "1px solid rgba(37,99,235,.2)",
    boxShadow: "0 10px 24px rgba(15,42,99,.2), 0 3px 10px rgba(37,99,235,.18)",
    willChange: "transform, opacity",
    transformOrigin: "50% 50%",
    display: "grid",
    placeItems: "center",
  });

  if (imageSrc) {
    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = "";
    image.decoding = "async";
    Object.assign(image.style, {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      padding: `${Math.max(5, Math.round(size * 0.1))}px`,
      display: "block",
    });
    image.addEventListener("error", () => applyFallbackVisual(clone), { once: true });
    clone.appendChild(image);
  } else {
    applyFallbackVisual(clone);
  }

  return clone;
}

function applyFallbackVisual(clone: HTMLDivElement): void {
  clone.innerHTML = "";
  clone.style.background = "linear-gradient(135deg, #0b63ce 0%, #0a4da6 100%)";
  clone.innerHTML =
    '<svg width="44%" height="44%" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="19" cy="20" r="1"/><path d="M3 4h2l2.4 10.6a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H7"/></svg>';
}

function createCanvasScene(): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
} | null {
  const canvas = document.createElement("canvas");
  const width = window.innerWidth;
  const height = window.innerHeight;

  // DPR=1 намеренно: Canvas живёт меньше секунды и не должен нагружать GPU.
  canvas.width = width;
  canvas.height = height;
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: "none",
    zIndex: "2147483000",
  });

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return null;
  return { canvas, ctx, width, height };
}

function drawTrail(ctx: CanvasRenderingContext2D, trail: TrailPoint[]): void {
  if (trail.length < 2) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < trail.length; i += 1) {
    const previous = trail[i - 1];
    const current = trail[i];
    const alpha = Math.max(0, Math.min(previous.life, current.life));
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(current.x, current.y);
    ctx.strokeStyle = `rgba(37,99,235,${alpha * 0.32})`;
    ctx.lineWidth = 1 + alpha * 2.2;
    ctx.stroke();
  }
  ctx.restore();
}

function quadraticPoint(start: Point, control: Point, end: Point, t: number): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x,
    y: mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y,
  };
}

function findVisibleCartTarget(): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-cart-target], [data-cart-icon], a[href='/cart'], a[href$='/cart']"
    )
  );

  return (
    candidates.find((element) => {
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (Number.parseFloat(style.opacity || "1") < 0.08) return false;
      const rect = element.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        rect.right >= 0 &&
        rect.left <= window.innerWidth &&
        rect.bottom >= 0 &&
        rect.top <= window.innerHeight
      );
    }) ?? null
  );
}

function pulseCart(target: HTMLElement, light: boolean): void {
  gsap.killTweensOf(target);
  gsap.fromTo(
    target,
    { scale: 1 },
    {
      scale: light ? 1.12 : 1.18,
      duration: 0.14,
      ease: "back.out(2.4)",
      yoyo: true,
      repeat: 1,
      transformOrigin: "50% 50%",
      clearProps: "transform",
    }
  );
}
