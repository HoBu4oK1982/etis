"use client";

import { useEffect, useRef } from "react";

export function AccountCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.3);
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const dots = Array.from({ length: mobile ? 9 : 20 }, (_, i) => ({
      x: (i * 0.137 + 0.07) % 1,
      y: (i * 0.233 + 0.13) % 1,
      phase: i * 0.72,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(114,180,255,.11)";
      const cx = width * 0.76;
      const cy = height * 0.44;
      [74, 118, 166].forEach((radius, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + Math.sin(time * 0.0007 + i) * 3, 0, Math.PI * 2);
        ctx.stroke();
      });

      dots.forEach((dot, i) => {
        const x = dot.x * width + Math.sin(time * 0.00045 + dot.phase) * 12;
        const y = dot.y * height + Math.cos(time * 0.00038 + dot.phase) * 8;
        ctx.fillStyle = i % 4 === 0 ? "rgba(108,190,255,.9)" : "rgba(255,255,255,.46)";
        ctx.beginPath();
        ctx.arc(x, y, i % 4 === 0 ? 2.2 : 1.25, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, []);

  return <canvas ref={ref} className="etis-account-canvas" aria-hidden="true" />;
}
