"use client";

import { useEffect, useRef } from "react";

export function CheckoutCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const points = Array.from({ length: mobile ? 8 : 16 }, (_, i) => ({
      x: (i * 0.173 + 0.08) % 1,
      y: (i * 0.287 + 0.14) % 1,
      r: 1.2 + (i % 3) * 0.65,
      speed: 0.00008 + (i % 4) * 0.000025,
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
      ctx.strokeStyle = "rgba(37, 99, 235, 0.08)";
      ctx.lineWidth = 1;

      const step = mobile ? 52 : 62;
      for (let x = -step; x < width + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height * 0.42, height);
        ctx.stroke();
      }

      points.forEach((point, index) => {
        const px = ((point.x + time * point.speed) % 1) * width;
        const py = point.y * height + Math.sin(time * 0.001 + index) * 6;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, point.r * 5);
        glow.addColorStop(0, "rgba(70, 160, 255, 0.8)");
        glow.addColorStop(1, "rgba(70, 160, 255, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, point.r * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.beginPath();
        ctx.arc(px, py, point.r, 0, Math.PI * 2);
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

  return <canvas ref={ref} className="etis-checkout-canvas" aria-hidden="true" />;
}
