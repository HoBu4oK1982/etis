"use client";

import { useEffect, useRef } from "react";

type Mode = "cart" | "wishlist" | "compare";

type Props = {
  mode: Mode;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
};

const MODE_ACCENT: Record<Mode, [number, number, number]> = {
  cart: [27, 104, 213],
  wishlist: [47, 117, 225],
  compare: [9, 83, 174],
};

/**
 * Лёгкий Canvas-фон для сервисных страниц магазина.
 * Один requestAnimationFrame, DPR ограничен 1.5, на скрытой вкладке цикл
 * полностью останавливается. Никакого WebGL/Three.js — только 2D Canvas.
 */
export function CommerceCanvas({ mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const accent = MODE_ACCENT[mode];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let raf = 0;
    let running = false;
    let particles: Particle[] = [];
    let pointerX = 0.68;
    let pointerY = 0.42;
    let skipMobileFrame = false;

    const createParticles = () => {
      const amount = width < 640 ? 8 : width < 1024 ? 15 : 24;
      particles = Array.from({ length: amount }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        radius: 0.9 + Math.random() * 1.8,
        phase: (Math.PI * 2 * index) / amount,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.2 : 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
      draw(true);
    };

    const drawGrid = () => {
      context.save();
      context.globalAlpha = 0.09;
      context.strokeStyle = `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`;
      context.lineWidth = 0.7;

      const step = width < 640 ? 42 : 54;
      const offsetX = (frame * 0.06) % step;
      for (let x = -step + offsetX; x < width + step; x += step) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y < height + step; y += step) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      context.restore();
    };

    const drawRoutes = () => {
      context.save();
      context.translate(width * pointerX, height * pointerY);
      context.rotate(-0.08);

      for (let ring = 0; ring < 4; ring += 1) {
        const radius = Math.min(width, height) * (0.22 + ring * 0.14);
        context.beginPath();
        context.arc(0, 0, radius, Math.PI * 0.86, Math.PI * 1.88);
        context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.16 - ring * 0.025})`;
        context.lineWidth = ring === 0 ? 1.5 : 1;
        context.stroke();
      }

      const pulse = 0.5 + Math.sin(frame * 0.025) * 0.22;
      context.beginPath();
      context.arc(0, 0, 6 + pulse * 5, 0, Math.PI * 2);
      context.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.18)`;
      context.fill();
      context.beginPath();
      context.arc(0, 0, 2.5, 0, Math.PI * 2);
      context.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.9)`;
      context.fill();
      context.restore();
    };

    const drawParticles = () => {
      context.save();

      for (const particle of particles) {
        if (!reducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -20) particle.x = width + 20;
          if (particle.x > width + 20) particle.x = -20;
          if (particle.y < -20) particle.y = height + 20;
          if (particle.y > height + 20) particle.y = -20;
        }

        const alpha = 0.28 + Math.sin(frame * 0.018 + particle.phase) * 0.12;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${alpha})`;
        context.fill();
      }

      if (width >= 640) {
        const maxDistance = width < 1024 ? 108 : 124;
        for (let i = 0; i < particles.length; i += 1) {
          for (let j = i + 1; j < particles.length; j += 1) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance >= maxDistance) continue;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${(1 - distance / maxDistance) * 0.1})`;
            context.lineWidth = 0.7;
            context.stroke();
          }
        }
      }

      context.restore();
    };

    const draw = (singleFrame = false) => {
      if (!singleFrame && coarsePointer) {
        skipMobileFrame = !skipMobileFrame;
        if (skipMobileFrame) {
          raf = window.requestAnimationFrame(() => draw(false));
          return;
        }
      }

      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width * pointerX,
        height * pointerY,
        0,
        width * pointerX,
        height * pointerY,
        Math.max(width, height) * 0.55
      );
      glow.addColorStop(0, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.16)`);
      glow.addColorStop(0.5, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.055)`);
      glow.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      drawGrid();
      drawRoutes();
      drawParticles();

      if (!singleFrame) {
        frame += 1;
        raf = window.requestAnimationFrame(() => draw(false));
      }
    };

    const start = () => {
      if (running || reducedMotion || document.hidden) return;
      running = true;
      raf = window.requestAnimationFrame(() => draw(false));
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(raf);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX += ((event.clientX - rect.left) / rect.width - pointerX) * 0.12;
      pointerY += ((event.clientY - rect.top) / rect.height - pointerY) * 0.12;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!coarsePointer) {
      canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    resize();
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (!coarsePointer) {
        canvas.removeEventListener("pointermove", onPointerMove);
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="etis-commerce-canvas" aria-hidden="true" />;
}
