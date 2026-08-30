"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./preloader.css";

const SHOW_ONCE_PER_SESSION = true;
const SESSION_KEY = "etis-preloader-shown-v2";
const MIN_SHOW_MS = 1900;
const MAX_SHOW_MS = 4200;

const BRAND = {
  blue: "#0a67d1",
  blueDark: "#062f72",
  cyan: "#4db8ff",
  white: "#ffffff",
  shadow: "rgba(6, 47, 114, 0.22)",
};

const MARK_PATH_D =
  "M954.03 0l494.43 908.54 -461.8 0 -444.54 847.36 -188.23 0 534.89 -1007.98 281.1 0 -203.29 -396.54 -755.75 1404.84 -210.82 0 954.03 -1756.21zm604.86 1099.28l90.35 198.27 -712.78 0 95.37 -198.27 527.05 0zm-667.6 331.29l30.12 128 888.46 0 87.84 195.76 -1174.02 0 167.6 -323.76z";

const LOGO_W = 4814.76;
const LOGO_H = 1756.21;
const MARK_DASH = 13000;

const GLYPHS: Record<"E" | "T" | "C", { d: string; advance: number }> = {
  E: {
    advance: 530,
    d: "M150 65.9999l340 0 0 -65.9999 -410 0 0 700 405.001 0 0 -65.9999 -335 0 0 -248 310 0 0 -65.9999 -310 0 0 -254z",
  },
  T: {
    advance: 540,
    d: "M520 700l0 -65.9999 -214.999 0 0 -634 -70.0003 0 0 634 -215 0 0 65.9999 500 0z",
  },
  C: {
    advance: 745,
    d: "M407 -11.9997c-106,0 -193.667,34.9993 -263,105 -69.3339,70.0003 -104,155.667 -104,257 0,101.333 34.6661,187 104,257 69.333,70.0003 157,105.001 263,105.001 64.667,0 124,-15.5007 178,-46.5004 54.0002,-30.9997 95.6667,-72.8332 125,-125.5l-62.0003 -36.0007c-22,42.667 -54.6667,76.6675 -98.0001,102.001 -43.3335,25.3331 -90.9997,38.0001 -143,38.0001 -87.3334,0 -158.667,-28.3339 -214,-84.9999 -55.334,-56.6669 -83.0006,-126.334 -83.0006,-209 0,-82.6664 27.6666,-152.334 83.0006,-209 55.3331,-56.6669 126.666,-85.0008 214,-85.0008 52,0 99.6662,12.667 143,38.0001 43.3335,25.334 76.0002,59.3336 98.0001,102.001l62.0003 -35.0002c-28.6671,-52.6664 -70.1665,-94.667 -124.5,-126 -54.3334,-31.3338 -113.833,-46.9998 -178.5,-46.9998z",
  },
};

const TEXT_X = 2016.08;
const TEXT_Y = 1431.72;
const FONT_SIZE = 1608.01;
const UNITS_PER_EM = 1000;
const GLYPH_SCALE = FONT_SIZE / UNITS_PER_EM;

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  shift: number;
  alpha: number;
};

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (hidden) return;

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    if (SHOW_ONCE_PER_SESSION) {
      try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
          setHidden(true);
          return;
        }
      } catch {}
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setHidden(true);
      return;
    }

    const prevOverflow = document.documentElement.style.overflow;
    const prevPaddingRight = document.documentElement.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      bg: 0,
      grid: 0,
      rings: 0,
      particles: 0,
      markDraw: 0,
      markFill: 0,
      letters: 0,
      subtitle: 0,
      shine: 0,
      exit: 0,
    };

    const letterA = { x: -56, y: 22, r: -8, a: 0 };
    const letterB = { x: -36, y: 18, r: -6, a: 0 };
    const letterC = { x: -16, y: 14, r: -4, a: 0 };

    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;
    let disposed = false;
    let finished = false;
    const startedAt = performance.now();
    const markPath = new Path2D(MARK_PATH_D);
    const glyphPaths = (Object.entries(GLYPHS) as ["E" | "T" | "C", { d: string; advance: number }][]).map(
      ([ch, g]) => ({ char: ch, path: new Path2D(g.d), advance: g.advance })
    );
    const particles = makeParticles(22);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(render);
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2 - H * 0.02;
      const logoHBase = Math.min(H * 0.16, W * 0.36, 200);
      const logoWBase = logoHBase * (LOGO_W / LOGO_H);
      const scale = logoWBase / LOGO_W;
      const logoX = cx - logoWBase / 2;
      const logoY = cy - logoHBase / 2;

      // background
      ctx.save();
      ctx.globalAlpha = Math.min(1, 0.92 * state.bg + 0.08);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "rgba(246, 250, 255, 0.98)");
      bg.addColorStop(1, "rgba(232, 241, 252, 0.98)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
      fog.addColorStop(0, `rgba(77,184,255,${0.10 * state.bg})`);
      fog.addColorStop(1, "rgba(77,184,255,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // engineering grid
      ctx.save();
      ctx.globalAlpha = 0.2 * state.grid;
      ctx.strokeStyle = "rgba(10, 103, 209, 0.12)";
      ctx.lineWidth = 1;
      const gap = Math.max(32, Math.min(54, Math.round(W / 34)));
      for (let x = gap / 2; x < W; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = gap / 2; y < H; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      // orbit rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = state.rings;
      [0.78, 1.05, 1.34, 1.64].forEach((mul, idx) => {
        const radius = logoHBase * mul * 1.25;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.lineWidth = idx % 2 === 0 ? 1.7 : 1.1;
        ctx.strokeStyle = idx % 2 === 0 ? "rgba(10,103,209,0.26)" : "rgba(77,184,255,0.16)";
        ctx.setLineDash(idx % 2 === 0 ? [] : [4, 6]);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // orbit / assembly particles
      ctx.save();
      ctx.translate(cx, cy);
      particles.forEach((p, idx) => {
        const t = now * 0.001 * p.speed + p.shift;
        const orbitRadius = logoHBase * (1.1 + (idx % 4) * 0.24) * (0.65 + 0.35 * state.particles);
        const converge = 1 - state.markDraw * 0.8;
        const radius = orbitRadius * converge;
        const x = Math.cos(t + p.angle) * radius;
        const y = Math.sin(t + p.angle) * radius * 0.72;
        const alpha = p.alpha * (0.35 + 0.65 * state.particles);
        ctx.fillStyle = idx % 4 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(10,103,209,${alpha})`;
        ctx.shadowColor = idx % 4 === 0 ? "rgba(255,255,255,0.6)" : "rgba(77,184,255,0.65)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // subtle glass behind logo
      const plateW = logoWBase * 1.12;
      const plateH = logoHBase * 1.55;
      drawGlassPlate(ctx, cx - plateW / 2, cy - plateH / 2, plateW, plateH, 28, 0.9 * Math.max(state.markDraw, state.letters));

      // logo
      ctx.save();
      ctx.translate(logoX, logoY);
      ctx.scale(scale, scale);

      const logoGrad = ctx.createLinearGradient(0, 0, LOGO_W, LOGO_H);
      logoGrad.addColorStop(0, BRAND.blue);
      logoGrad.addColorStop(1, BRAND.blueDark);

      if (state.markFill > 0.001) {
        ctx.save();
        ctx.clip(markPath);
        const level = LOGO_H * (1 - state.markFill);
        const waveT = now * 0.0026;
        const amp = 28 * (1 - state.markFill * 0.7);
        ctx.beginPath();
        ctx.moveTo(-40, LOGO_H + 40);
        ctx.lineTo(-40, level);
        for (let x = -40; x <= 1800; x += 42) {
          ctx.lineTo(x, level + Math.sin(x * 0.007 + waveT) * amp + Math.cos(x * 0.014 - waveT * 1.4) * amp * 0.35);
        }
        ctx.lineTo(1800, LOGO_H + 40);
        ctx.closePath();
        ctx.fillStyle = logoGrad;
        ctx.fill();
        ctx.restore();
      }

      ctx.lineWidth = 14;
      ctx.lineJoin = "round";
      ctx.strokeStyle = `rgba(6, 47, 114, ${0.65 + 0.35 * state.markDraw})`;
      if (state.markDraw < 1) {
        ctx.setLineDash([MARK_DASH]);
        ctx.lineDashOffset = MARK_DASH * (1 - state.markDraw);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke(markPath);
      ctx.setLineDash([]);

      drawGlyph(ctx, glyphPaths[0], TEXT_X, TEXT_Y, letterA, logoGrad);
      drawGlyph(ctx, glyphPaths[1], TEXT_X + glyphPaths[0].advance * GLYPH_SCALE, TEXT_Y, letterB, logoGrad);
      drawGlyph(
        ctx,
        glyphPaths[2],
        TEXT_X + (glyphPaths[0].advance + glyphPaths[1].advance) * GLYPH_SCALE,
        TEXT_Y,
        letterC,
        logoGrad
      );

      if (state.shine > 0.01) {
        ctx.save();
        const shineX = -LOGO_W * 0.45 + (LOGO_W * 1.95) * state.shine;
        ctx.translate(shineX, 0);
        ctx.rotate(-0.24);
        const shine = ctx.createLinearGradient(0, 0, 420, 0);
        shine.addColorStop(0, "rgba(255,255,255,0)");
        shine.addColorStop(0.5, "rgba(255,255,255,0.55)");
        shine.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = shine;
        ctx.fillRect(0, -200, 420, LOGO_H + 400);
        ctx.restore();
      }

      ctx.restore();

      // text
      ctx.save();
      ctx.globalAlpha = state.subtitle;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(6, 47, 114, 0.54)";
      ctx.font = "600 13px Inter, system-ui, sans-serif";
      ctx.fillText("сборка инженерной системы", cx, cy + plateH * 0.62);
      ctx.font = "800 16px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(6, 47, 114, 0.84)";
      ctx.fillText("ETIS.KZ", cx, cy + plateH * 0.76);
      ctx.restore();
    };

    const tl = gsap.timeline();
    tl.to(state, { bg: 1, duration: 0.28, ease: "power2.out" });
    tl.to(state, { grid: 1, duration: 0.35, ease: "power2.out" }, "<");
    tl.to(state, { rings: 1, particles: 1, duration: 0.55, ease: "power2.out" }, "-=0.1");
    tl.to(state, { markDraw: 1, duration: 0.78, ease: "power3.inOut" }, "-=0.2");
    tl.to(state, { markFill: 1, duration: 0.62, ease: "power2.out" }, "-=0.18");
    tl.to(letterA, { x: 0, y: 0, r: 0, a: 1, duration: 0.48, ease: "back.out(1.8)" }, "-=0.16");
    tl.to(letterB, { x: 0, y: 0, r: 0, a: 1, duration: 0.5, ease: "back.out(1.8)" }, "-=0.36");
    tl.to(letterC, { x: 0, y: 0, r: 0, a: 1, duration: 0.52, ease: "back.out(1.8)" }, "-=0.34");
    tl.to(state, { subtitle: 1, duration: 0.4, ease: "power2.out" }, "-=0.22");
    tl.to(state, { shine: 1, duration: 0.7, ease: "power2.inOut" }, "-=0.18");

    const finish = () => {
      if (finished || disposed) return;
      finished = true;
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_SHOW_MS - elapsed);

      const out = gsap.timeline({ delay: wait / 1000 + 0.12 });
      out.to(state, { subtitle: 0, duration: 0.18, ease: "power2.out" });
      out.to(
        state,
        {
          rings: 0,
          particles: 0,
          duration: 0.32,
          ease: "power2.out",
        },
        "<"
      );
      out.to(
        root,
        {
          autoAlpha: 0,
          scale: 1.02,
          y: -14,
          duration: 0.48,
          ease: "power3.inOut",
          onComplete: () => {
            dispose();
            try {
              sessionStorage.setItem(SESSION_KEY, "1");
            } catch {}
            setHidden(true);
          },
        },
        "-=0.08"
      );
    };

    const dispose = () => {
      disposed = true;
      cancelAnimationFrame(raf);
      gsap.killTweensOf(state);
      gsap.killTweensOf(letterA);
      gsap.killTweensOf(letterB);
      gsap.killTweensOf(letterC);
      gsap.killTweensOf(root);
      document.documentElement.style.overflow = prevOverflow;
      document.documentElement.style.paddingRight = prevPaddingRight;
    };

    gsap.set(root, { autoAlpha: 1, scale: 1, y: 0 });

    resize();

    if (reduceMotion) {
      state.bg = 1;
      state.grid = 1;
      state.rings = 1;
      state.particles = 1;
      state.markDraw = 1;
      state.markFill = 1;
      state.subtitle = 1;
      letterA.a = 1;
      letterB.a = 1;
      letterC.a = 1;
      letterA.x = letterA.y = letterA.r = 0;
      letterB.x = letterB.y = letterB.r = 0;
      letterC.x = letterC.y = letterC.r = 0;
      raf = requestAnimationFrame(render);
      const timer = window.setTimeout(finish, 500);
      return () => {
        window.clearTimeout(timer);
        dispose();
      };
    }

    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(render);

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    const maxTimer = window.setTimeout(finish, MAX_SHOW_MS);

    return () => {
      window.clearTimeout(maxTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("load", finish);
      dispose();
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div ref={rootRef} className="etis-preloader" aria-hidden="true">
      <canvas ref={canvasRef} className="etis-preloader__canvas" />
    </div>
  );
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  glyph: { path: Path2D; advance: number },
  x: number,
  y: number,
  state: { x: number; y: number; r: number; a: number },
  fill: CanvasGradient
) {
  if (state.a <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = state.a;
  ctx.translate(x + state.x * 10, y + state.y * 10);
  ctx.rotate((state.r * Math.PI) / 180);
  ctx.scale(GLYPH_SCALE, -GLYPH_SCALE);
  ctx.fillStyle = fill;
  ctx.fill(glyph.path);
  ctx.restore();
}

function drawGlassPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  alpha: number
) {
  if (alpha <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, "rgba(255,255,255,0.72)");
  grad.addColorStop(1, "rgba(215,231,248,0.42)");
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = grad;
  ctx.shadowColor = BRAND.shadow;
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.restore();
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: Math.PI * 2 * (i / count),
    radius: 1,
    speed: 0.45 + Math.random() * 0.55,
    size: 2.5 + Math.random() * 3.2,
    shift: Math.random() * Math.PI * 2,
    alpha: 0.35 + Math.random() * 0.55,
  }));
}
