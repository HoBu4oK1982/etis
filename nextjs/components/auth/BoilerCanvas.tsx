"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-фон для страниц входа и регистрации.
 *
 * Композиция «инженерная»: в центре — стилизованный котёл, к нему
 * подведены три трубы:
 *   • cold-подача сверху (голубой поток → в котёл)
 *   • hot-контур справа-вниз (красный поток → из котла)
 *   • return-обратка слева-вниз (голубой поток → в котёл)
 *
 * Внутри каждой трубы бегут «пакеты» частиц: по направлению потока,
 * циклично. Вокруг котла — пульсирующий тёплый ореол, из вершины
 * поднимаются редкие пузыри пара. На корпусе — миниатюрная шкала
 * с покачивающейся стрелкой давления.
 *
 * Ноль ассетов, всё рисуется примитивами. DPR ограничен 2 (Retina —
 * ок, дальнейший смысла нет). Один rAF-цикл, при потере вкладки
 * анимация ставится на паузу, при prefers-reduced-motion — статичный
 * кадр. Внутри вкладки цикл сам себя дросселирует ниже 60 FPS —
 * никакой отдельной throttle-обвязки не нужно.
 */
export function BoilerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---- Размеры ---- */
    let width = 0;
    let height = 0;

    // Локальная система координат: viewport 720 × 900. Всё внутри
    // рисуется в этих единицах, затем масштабируется под реальный
    // размер canvas. Так пропорции котла/труб не «плавают» на разных
    // экранах, а координаты подписаны в человекочитаемых числах.
    const VW = 720;
    const VH = 900;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ---- Геометрия труб ----
       Каждая труба — сегментированная ломаная (список точек). Частицы
       движутся вдоль неё; direction = 1 — «в котёл», -1 — «из котла».
       Пересчитываются позже, когда котёл получит финальные координаты. */

    type Pipe = {
      color: "cold" | "hot";
      points: { x: number; y: number }[];
      length: number;
      cumulative: number[]; // накопленная длина к каждой точке
      direction: 1 | -1;
    };

    const buildPipe = (
      points: { x: number; y: number }[],
      color: "cold" | "hot",
      direction: 1 | -1
    ): Pipe => {
      const cumulative = [0];
      let length = 0;
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        length += Math.hypot(dx, dy);
        cumulative.push(length);
      }
      return { color, points, length, cumulative, direction };
    };

    /* ---- Котёл ---- */

    // Центр котла в системе VW×VH
    const BOILER = {
      cx: VW * 0.5,
      cy: VH * 0.5 + 40,
      w: 220,
      h: 300,
      r: 26, // радиус скругления углов
    };

    /* ---- Трубы --- */

    // Cold supply — сверху в котёл (пришла холодная вода/теплоноситель)
    const coldSupply = buildPipe(
      [
        { x: BOILER.cx - 40, y: -20 },
        { x: BOILER.cx - 40, y: 130 },
        { x: BOILER.cx - 90, y: 180 },
        { x: BOILER.cx - 90, y: BOILER.cy - BOILER.h / 2 - 30 },
        { x: BOILER.cx - 60, y: BOILER.cy - BOILER.h / 2 },
      ],
      "cold",
      1
    );

    // Hot flow — из котла вправо-вниз (подача горячего теплоносителя)
    const hotFlow = buildPipe(
      [
        { x: BOILER.cx + 60, y: BOILER.cy + BOILER.h / 2 },
        { x: BOILER.cx + 100, y: BOILER.cy + BOILER.h / 2 + 40 },
        { x: BOILER.cx + 210, y: BOILER.cy + BOILER.h / 2 + 40 },
        { x: BOILER.cx + 240, y: BOILER.cy + BOILER.h / 2 + 90 },
        { x: BOILER.cx + 240, y: VH + 20 },
      ],
      "hot",
      -1
    );

    // Cold return — обратка снизу-слева в котёл
    const coldReturn = buildPipe(
      [
        { x: -20, y: VH * 0.72 },
        { x: BOILER.cx - 220, y: VH * 0.72 },
        { x: BOILER.cx - 190, y: VH * 0.72 - 40 },
        { x: BOILER.cx - 60, y: VH * 0.72 - 40 },
        { x: BOILER.cx - 30, y: BOILER.cy + BOILER.h / 2 },
      ],
      "cold",
      1
    );

    const pipes: Pipe[] = [coldSupply, hotFlow, coldReturn];

    /* ---- Частицы ---- */

    type Particle = {
      pipeIdx: number;
      progress: number; // 0..1 позиция вдоль трубы
      speed: number;    // прирост progress в кадре
      size: number;
    };

    const particles: Particle[] = [];
    // Плотность подбирал вручную: ниже — «прерывистый» поток, выше —
    // сплошная линия без ощущения потока.
    const PARTICLES_PER_PIPE = 14;
    for (let i = 0; i < pipes.length; i++) {
      for (let j = 0; j < PARTICLES_PER_PIPE; j++) {
        particles.push({
          pipeIdx: i,
          progress: j / PARTICLES_PER_PIPE + Math.random() * 0.02,
          speed: 0.0018 + Math.random() * 0.0009,
          size: 2 + Math.random() * 1.2,
        });
      }
    }

    /* ---- Пар (bubbles над котлом) ---- */

    type Steam = { x: number; y: number; r: number; life: number; ttl: number };
    const steam: Steam[] = [];

    const spawnSteam = () => {
      steam.push({
        x: BOILER.cx - 40 + (Math.random() - 0.5) * 22,
        y: BOILER.cy - BOILER.h / 2 - 20,
        r: 6 + Math.random() * 4,
        life: 0,
        ttl: 140 + Math.random() * 80,
      });
    };

    /* ---- Утилита: позиция и направление на трубе ---- */

    const pipePointAt = (pipe: Pipe, t: number) => {
      // t в 0..1 по всей длине; направление уже применяем снаружи
      const target = t * pipe.length;
      for (let i = 1; i < pipe.points.length; i++) {
        if (target <= pipe.cumulative[i]) {
          const segLen = pipe.cumulative[i] - pipe.cumulative[i - 1];
          const local = segLen === 0 ? 0 : (target - pipe.cumulative[i - 1]) / segLen;
          const a = pipe.points[i - 1];
          const b = pipe.points[i];
          return {
            x: a.x + (b.x - a.x) * local,
            y: a.y + (b.y - a.y) * local,
          };
        }
      }
      const last = pipe.points[pipe.points.length - 1];
      return { x: last.x, y: last.y };
    };

    /* ---- Рисование ---- */

    const COLORS = {
      pipeBase: "rgba(1, 42, 106, 0.10)",
      pipeStroke: "rgba(1, 42, 106, 0.22)",
      cold: {
        core: "#0180cf",
        glow: "rgba(1, 128, 207, 0.55)",
      },
      hot: {
        core: "#d73030",
        glow: "rgba(215, 48, 48, 0.55)",
      },
      boilerFrom: "#0b3f89",
      boilerTo: "#03163d",
      heatGlow: "rgba(255, 122, 46, ",
    };

    // Масштаб для перевода VW×VH → пиксели canvas'а
    const scale = () => {
      const s = Math.min(width / VW, height / VH);
      const ox = (width - VW * s) / 2;
      const oy = (height - VH * s) / 2;
      return { s, ox, oy };
    };

    const drawPipes = (state: { pulse: number }) => {
      const { s, ox, oy } = scale();
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(s, s);

      // 1. Оболочка труб (широкая, полупрозрачная)
      for (const pipe of pipes) {
        ctx.beginPath();
        ctx.moveTo(pipe.points[0].x, pipe.points[0].y);
        for (let i = 1; i < pipe.points.length; i++) {
          ctx.lineTo(pipe.points[i].x, pipe.points[i].y);
        }
        ctx.strokeStyle = COLORS.pipeBase;
        ctx.lineWidth = 22;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        ctx.strokeStyle = COLORS.pipeStroke;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // 2. Тёплый ореол вокруг котла — пульсирующий
      const glowAlpha = 0.28 + 0.14 * Math.sin(state.pulse);
      const heatGrad = ctx.createRadialGradient(
        BOILER.cx,
        BOILER.cy,
        20,
        BOILER.cx,
        BOILER.cy,
        260
      );
      heatGrad.addColorStop(0, `${COLORS.heatGlow}${glowAlpha})`);
      heatGrad.addColorStop(0.55, `${COLORS.heatGlow}${glowAlpha * 0.35})`);
      heatGrad.addColorStop(1, `${COLORS.heatGlow}0)`);
      ctx.fillStyle = heatGrad;
      ctx.beginPath();
      ctx.arc(BOILER.cx, BOILER.cy, 260, 0, Math.PI * 2);
      ctx.fill();

      // 3. Частицы внутри труб
      for (const p of particles) {
        const pipe = pipes[p.pipeIdx];
        // direction управляет тем, в какую сторону едем
        const t = pipe.direction === 1 ? p.progress : 1 - p.progress;
        const pos = pipePointAt(pipe, t);

        const palette = pipe.color === "cold" ? COLORS.cold : COLORS.hot;

        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 4);
        glow.addColorStop(0, palette.glow);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = palette.core;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawBoiler = (state: { pulse: number; gaugeT: number }) => {
      const { s, ox, oy } = scale();
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(s, s);

      const x = BOILER.cx - BOILER.w / 2;
      const y = BOILER.cy - BOILER.h / 2;

      // Тень под котлом
      ctx.save();
      ctx.filter = "blur(24px)";
      ctx.fillStyle = "rgba(3, 22, 61, 0.35)";
      ctx.beginPath();
      roundRect(ctx, x + 12, y + 22, BOILER.w, BOILER.h, BOILER.r);
      ctx.fill();
      ctx.restore();

      // Корпус — вертикальный градиент
      const bodyGrad = ctx.createLinearGradient(x, y, x, y + BOILER.h);
      bodyGrad.addColorStop(0, COLORS.boilerFrom);
      bodyGrad.addColorStop(1, COLORS.boilerTo);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      roundRect(ctx, x, y, BOILER.w, BOILER.h, BOILER.r);
      ctx.fill();

      // Верхний блик — металлическое отражение
      const hi = ctx.createLinearGradient(x, y, x, y + 60);
      hi.addColorStop(0, "rgba(255, 255, 255, 0.16)");
      hi.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = hi;
      ctx.beginPath();
      roundRect(ctx, x, y, BOILER.w, 60, { tl: BOILER.r, tr: BOILER.r, br: 0, bl: 0 });
      ctx.fill();

      // Индикаторная полоса — оранжевый пульсирующий уровень
      const stripeY = y + BOILER.h * 0.34;
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(x + 20, stripeY, BOILER.w - 40, 14);
      const level = 0.6 + 0.15 * Math.sin(state.pulse * 1.2);
      const heatStripe = ctx.createLinearGradient(x, stripeY, x + BOILER.w, stripeY);
      heatStripe.addColorStop(0, "#ff7a2e");
      heatStripe.addColorStop(1, "#ffb347");
      ctx.fillStyle = heatStripe;
      ctx.fillRect(x + 20, stripeY, (BOILER.w - 40) * level, 14);

      // Циферблат-манометр (нижний правый угол)
      const gx = x + BOILER.w - 54;
      const gy = y + BOILER.h - 54;
      const gr = 22;
      ctx.fillStyle = "#0a1f4a";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Стрелка манометра — покачивается около 0.7 от полного оборота
      const needleAngle = -Math.PI / 2 + state.gaugeT + Math.PI * 0.6;
      ctx.strokeStyle = "#ff7a2e";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + Math.cos(needleAngle) * (gr - 6), gy + Math.sin(needleAngle) * (gr - 6));
      ctx.stroke();

      ctx.fillStyle = "#ff7a2e";
      ctx.beginPath();
      ctx.arc(gx, gy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Логотип «ETC» тусклый на корпусе
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      ctx.font = "700 22px 'Magistral', 'Gilroy', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ETC", BOILER.cx, y + BOILER.h * 0.7);

      // Заклёпки по периметру
      ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
      const rivets = [
        [x + 18, y + 18],
        [x + BOILER.w - 18, y + 18],
        [x + 18, y + BOILER.h - 18],
        [x + BOILER.w - 18, y + BOILER.h - 18],
      ];
      for (const [rx, ry] of rivets) {
        ctx.beginPath();
        ctx.arc(rx, ry, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawSteam = () => {
      const { s, ox, oy } = scale();
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(s, s);

      for (const b of steam) {
        const progress = b.life / b.ttl;
        const alpha = Math.sin(progress * Math.PI) * 0.35; // fade-in + fade-out
        const y = b.y - progress * 90;
        const drift = Math.sin(progress * 4) * 6;
        ctx.fillStyle = `rgba(180, 200, 220, ${alpha})`;
        ctx.beginPath();
        ctx.arc(b.x + drift, y, b.r + progress * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    /* ---- Главный цикл ---- */

    let raf = 0;
    let running = true;
    const state = { pulse: 0, gaugeT: 0 };

    let steamTick = 0;

    const step = () => {
      if (!running) return;

      // очистка
      ctx.clearRect(0, 0, width, height);

      state.pulse += 0.03;
      // Небольшое покачивание стрелки манометра — «дыхание» системы
      state.gaugeT = Math.sin(state.pulse * 0.4) * 0.14;

      // Двигаем частицы
      if (!reduced) {
        for (const p of particles) {
          p.progress += p.speed;
          if (p.progress >= 1) p.progress -= 1;
        }
        steamTick++;
        if (steamTick % 22 === 0) spawnSteam();
        for (const b of steam) b.life += 1;
        // Удаляем «отжившие» пузыри пара
        for (let i = steam.length - 1; i >= 0; i--) {
          if (steam[i].life > steam[i].ttl) steam.splice(i, 1);
        }
      }

      drawPipes(state);
      drawBoiler(state);
      drawSteam();

      raf = requestAnimationFrame(step);
    };

    /* ---- Управление жизненным циклом ---- */

    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      if (visible && !running) {
        running = true;
        raf = requestAnimationFrame(step);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    resize();
    if (reduced) {
      // одна отрисовка, без движения
      drawPipes(state);
      drawBoiler(state);
    } else {
      raf = requestAnimationFrame(step);
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="etis-auth-canvas" aria-hidden />;
}

/* ---- helpers ---- */

type Radii =
  | number
  | { tl: number; tr: number; br: number; bl: number };

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: Radii
) {
  const rr =
    typeof r === "number" ? { tl: r, tr: r, br: r, bl: r } : r;
  ctx.beginPath();
  ctx.moveTo(x + rr.tl, y);
  ctx.lineTo(x + w - rr.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr.tr);
  ctx.lineTo(x + w, y + h - rr.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr.br, y + h);
  ctx.lineTo(x + rr.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr.bl);
  ctx.lineTo(x, y + rr.tl);
  ctx.quadraticCurveTo(x, y, x + rr.tl, y);
  ctx.closePath();
}
