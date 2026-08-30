"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import styles from "./not-found.module.css";

/* ============================================================
   404 — «Авария в магистрали»
   Тёмная техническая схема: слева — контур отопления (hot),
   справа — контур холодоснабжения (cold). В центре — разрыв,
   из которого хлещет вода/хладагент и валит пар.
   ============================================================ */

type Pipe = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hot: boolean;
  thickness: number;
};

type Flow = {
  pipe: Pipe;
  t: number;
  speed: number;
};

type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  hot: boolean;
};

type Steam = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
};

type Joint = { x: number; y: number; hot: boolean };

export default function NotFound() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0;
    let H = 0;

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    let pipes: Pipe[] = [];
    let joints: Joint[] = [];
    let flows: Flow[] = [];
    let drops: Drop[] = [];
    let steam: Steam[] = [];

    /* ---------- Размеры ---------- */
    const setSize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ---------- Построение сцены ---------- */
    const buildScene = () => {
      pipes = [];
      joints = [];
      flows = [];

      const cx = W / 2;
      const trunk = H * 0.5;
      // Ширина разрыва — подстраивается под ширину экрана и размер цифр 404
      const gap = Math.min(Math.max(W * 0.14, 160), 340);

      // Магистрали
      pipes.push({ x1: 0, y1: trunk, x2: cx - gap, y2: trunk, hot: true, thickness: 15 });
      pipes.push({ x1: cx + gap, y1: trunk, x2: W, y2: trunk, hot: false, thickness: 15 });

      // На широких экранах добавляем сеть ответвлений
      if (W > 720) {
        // --- HOT (левая половина) ---
        const hL = cx - gap;
        const hotBranches: Array<Omit<Pipe, "hot" | "thickness">> = [
          // Верхнее ответвление
          { x1: 0,           y1: trunk - 190, x2: hL * 0.55, y2: trunk - 190 },
          { x1: hL * 0.55,   y1: trunk - 190, x2: hL * 0.55, y2: trunk },
          // Нижнее ответвление
          { x1: 0,           y1: trunk + 170, x2: hL * 0.42, y2: trunk + 170 },
          { x1: hL * 0.42,   y1: trunk + 170, x2: hL * 0.42, y2: trunk },
          // Уход вниз ближе к центру
          { x1: hL * 0.78,   y1: trunk,       x2: hL * 0.78, y2: trunk + 230 },
          { x1: hL * 0.78,   y1: trunk + 230, x2: hL * 0.35, y2: trunk + 230 },
        ];
        hotBranches.forEach((b) => pipes.push({ ...b, hot: true, thickness: 8 }));

        // Джоинты (фитинги)
        joints.push(
          { x: hL * 0.55, y: trunk - 190, hot: true },
          { x: hL * 0.55, y: trunk,       hot: true },
          { x: hL * 0.42, y: trunk + 170, hot: true },
          { x: hL * 0.42, y: trunk,       hot: true },
          { x: hL * 0.78, y: trunk,       hot: true },
          { x: hL * 0.78, y: trunk + 230, hot: true },
          { x: hL * 0.35, y: trunk + 230, hot: true },
        );

        // --- COLD (правая половина) ---
        const cR = cx + gap;
        const cW = W - cR;
        const coldBranches: Array<Omit<Pipe, "hot" | "thickness">> = [
          { x1: W,               y1: trunk - 210, x2: cR + cW * 0.5,  y2: trunk - 210 },
          { x1: cR + cW * 0.5,   y1: trunk - 210, x2: cR + cW * 0.5,  y2: trunk },
          { x1: W,               y1: trunk + 190, x2: cR + cW * 0.42, y2: trunk + 190 },
          { x1: cR + cW * 0.42,  y1: trunk + 190, x2: cR + cW * 0.42, y2: trunk },
          { x1: cR + cW * 0.22,  y1: trunk,       x2: cR + cW * 0.22, y2: trunk - 260 },
          { x1: cR + cW * 0.22,  y1: trunk - 260, x2: cR + cW * 0.6,  y2: trunk - 260 },
        ];
        coldBranches.forEach((b) => pipes.push({ ...b, hot: false, thickness: 8 }));

        joints.push(
          { x: cR + cW * 0.5,  y: trunk - 210, hot: false },
          { x: cR + cW * 0.5,  y: trunk,       hot: false },
          { x: cR + cW * 0.42, y: trunk + 190, hot: false },
          { x: cR + cW * 0.42, y: trunk,       hot: false },
          { x: cR + cW * 0.22, y: trunk,       hot: false },
          { x: cR + cW * 0.22, y: trunk - 260, hot: false },
          { x: cR + cW * 0.6,  y: trunk - 260, hot: false },
        );
      }

      // Джоинты у обрубленных концов магистрали
      joints.push({ x: cx - gap, y: trunk, hot: true });
      joints.push({ x: cx + gap, y: trunk, hot: false });

      // Flows — по несколько частиц на трубу пропорционально длине
      for (const p of pipes) {
        const len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1);
        const count = Math.max(1, Math.floor(len / 180));
        for (let i = 0; i < count; i++) {
          flows.push({
            pipe: p,
            t: i / count + Math.random() * 0.08,
            speed: 0.0022 + Math.random() * 0.0018,
          });
        }
      }
    };

    /* ---------- Отрисовка фона ---------- */
    const drawBackground = () => {
      // Тёмная база с радиальным градиентом
      const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
      grad.addColorStop(0, "#0a1628");
      grad.addColorStop(0.55, "#050a17");
      grad.addColorStop(1, "#02040c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Тёплая подложка слева
      const hotWash = ctx.createLinearGradient(0, 0, W / 2, 0);
      hotWash.addColorStop(0, "rgba(220, 80, 40, 0.13)");
      hotWash.addColorStop(1, "rgba(220, 80, 40, 0)");
      ctx.fillStyle = hotWash;
      ctx.fillRect(0, 0, W / 2, H);

      // Холодная подложка справа
      const coldWash = ctx.createLinearGradient(W / 2, 0, W, 0);
      coldWash.addColorStop(0, "rgba(40, 130, 240, 0)");
      coldWash.addColorStop(1, "rgba(40, 130, 240, 0.16)");
      ctx.fillStyle = coldWash;
      ctx.fillRect(W / 2, 0, W / 2, H);

      // Техническая сетка
      ctx.strokeStyle = "rgba(120, 160, 220, 0.045)";
      ctx.lineWidth = 1;
      const gridSize = 44;
      ctx.beginPath();
      for (let x = 0; x < W; x += gridSize) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, H);
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(W, y + 0.5);
      }
      ctx.stroke();
    };

    /* ---------- Труба ---------- */
    const drawPipe = (p: Pipe) => {
      const glow = p.hot ? "rgba(239, 68, 68, 0.35)" : "rgba(59, 130, 246, 0.35)";
      const accent = p.hot ? "#ef4444" : "#3b82f6";

      // Наружное свечение
      ctx.strokeStyle = glow;
      ctx.lineWidth = p.thickness + 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();

      // Металл трубы — градиент перпендикулярно оси
      const horizontal = Math.abs(p.y2 - p.y1) < 0.5;
      const bodyGrad = horizontal
        ? ctx.createLinearGradient(p.x1, p.y1 - p.thickness / 2, p.x1, p.y1 + p.thickness / 2)
        : ctx.createLinearGradient(p.x1 - p.thickness / 2, p.y1, p.x1 + p.thickness / 2, p.y1);
      bodyGrad.addColorStop(0, "#2b3a54");
      bodyGrad.addColorStop(0.5, "#556986");
      bodyGrad.addColorStop(1, "#1a2333");

      ctx.strokeStyle = bodyGrad;
      ctx.lineWidth = p.thickness;
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();

      // Индикаторная жила (цветная жидкость внутри)
      ctx.strokeStyle = accent;
      ctx.lineWidth = p.thickness * 0.3;
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
    };

    /* ---------- Джоинт (фитинг) ---------- */
    const drawJoint = (j: Joint) => {
      const accent = j.hot ? "#ef4444" : "#3b82f6";
      const glow = j.hot ? "rgba(239, 68, 68, 0.5)" : "rgba(59, 130, 246, 0.5)";

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(j.x, j.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1a2333";
      ctx.strokeStyle = "#556986";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(j.x, j.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    };

    /* ---------- Бегущая частица жидкости внутри трубы ---------- */
    const drawFlow = (f: Flow, dt: number) => {
      const p = f.pipe;
      f.t += f.speed * dt;
      if (f.t > 1) f.t -= 1;
      const x = p.x1 + (p.x2 - p.x1) * f.t;
      const y = p.y1 + (p.y2 - p.y1) * f.t;
      const color = p.hot ? "#fff2c9" : "#dceeff";
      const glowColor = p.hot ? "#f59e0b" : "#60a5fa";

      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, p.thickness * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    /* ---------- Обрывы (закрытые торцы + свечение) ---------- */
    const drawRuptures = (t: number) => {
      const cx = W / 2;
      const trunk = H * 0.5;
      const gap = Math.min(Math.max(W * 0.14, 160), 340);

      // Пульс свечения из разрывов
      const pulse = 0.6 + Math.sin(t * 0.005) * 0.25;

      const drawEnd = (x: number, hot: boolean) => {
        const glow = hot ? "rgba(239, 68, 68, " + (0.6 * pulse) + ")" : "rgba(59, 130, 246, " + (0.6 * pulse) + ")";
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, trunk, 32 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Тёмный «зев» разрыва
        ctx.fillStyle = "#02040c";
        ctx.beginPath();
        ctx.arc(x, trunk, 8, 0, Math.PI * 2);
        ctx.fill();

        // «Рваные» края (мелкие треугольнички вокруг разрыва)
        ctx.strokeStyle = hot ? "#ef4444" : "#3b82f6";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + (hot ? t * 0.0004 : -t * 0.0004);
          const rInner = 8;
          const rOuter = 13 + Math.sin(t * 0.01 + i) * 2;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * rInner, trunk + Math.sin(a) * rInner);
          ctx.lineTo(x + Math.cos(a) * rOuter, trunk + Math.sin(a) * rOuter);
          ctx.stroke();
        }
      };

      drawEnd(cx - gap, true);
      drawEnd(cx + gap, false);
    };

    /* ---------- Спавн капель и пара ---------- */
    const spawnEmissions = () => {
      const cx = W / 2;
      const trunk = H * 0.5;
      const gap = Math.min(Math.max(W * 0.14, 160), 340);

      // Капли из горячего разрыва
      if (Math.random() < 0.7) {
        drops.push({
          x: cx - gap + (Math.random() - 0.5) * 10,
          y: trunk + 6,
          vx: -0.3 - Math.random() * 0.6,
          vy: 0.5 + Math.random() * 1.4,
          r: 1.5 + Math.random() * 2.4,
          life: 1,
          hot: true,
        });
      }
      // Капли из холодного разрыва
      if (Math.random() < 0.6) {
        drops.push({
          x: cx + gap + (Math.random() - 0.5) * 10,
          y: trunk + 6,
          vx: 0.3 + Math.random() * 0.6,
          vy: 0.4 + Math.random() * 1.2,
          r: 1.5 + Math.random() * 2.2,
          life: 1,
          hot: false,
        });
      }
      // Пар из горячего разрыва
      if (Math.random() < 0.55) {
        steam.push({
          x: cx - gap + (Math.random() - 0.5) * 20,
          y: trunk - 8,
          vx: (Math.random() - 0.6) * 0.4,
          vy: -0.5 - Math.random() * 0.8,
          r: 10 + Math.random() * 18,
          life: 1,
        });
      }
      // «Изморозь» — редкие иней-искорки над холодным разрывом
      if (Math.random() < 0.25) {
        steam.push({
          x: cx + gap + (Math.random() - 0.4) * 20,
          y: trunk - 6,
          vx: (Math.random() - 0.4) * 0.3,
          vy: -0.3 - Math.random() * 0.5,
          r: 6 + Math.random() * 10,
          life: 0.6,
        });
      }
      // Ограничения — чтобы не разросся массив
      if (drops.length > 220) drops.splice(0, drops.length - 220);
      if (steam.length > 90) steam.splice(0, steam.length - 90);
    };

    /* ---------- Основной цикл ---------- */
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dtMs = Math.min(now - last, 40);
      last = now;
      const dt = dtMs / 16.67; // нормализуем к 60fps

      // Параллакс от мыши (сглаженно)
      mouse.tx += (mouse.x - mouse.tx) * 0.05;
      mouse.ty += (mouse.y - mouse.ty) * 0.05;

      drawBackground();

      ctx.save();
      ctx.translate(mouse.tx * 0.025, mouse.ty * 0.025);

      // Трубы
      for (const p of pipes) drawPipe(p);
      // Фитинги
      for (const j of joints) drawJoint(j);
      // Бегущая жидкость
      for (const f of flows) drawFlow(f, dt);
      // Разрывы поверх
      drawRuptures(now);

      ctx.restore();

      // === Пар (позади капель, аддитивно) ===
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      steam = steam.filter((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.r += 0.35 * dt;
        s.life -= 0.008 * dt;
        if (s.life <= 0) return false;
        const alpha = s.life * 0.14;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0, `rgba(255, 230, 200, ${alpha})`);
        g.addColorStop(1, "rgba(255, 230, 200, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.restore();

      // === Капли ===
      drops = drops.filter((d) => {
        d.vy += 0.06 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.life -= 0.006 * dt;
        if (d.y > H + 20 || d.life <= 0) return false;

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = d.hot ? "#f97316" : "#3b82f6";
        ctx.fillStyle = d.hot
          ? `rgba(255, 140, 90, ${d.life})`
          : `rgba(160, 210, 255, ${d.life})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      spawnEmissions();

      raf = requestAnimationFrame(tick);
    };

    /* ---------- Инициализация ---------- */
    setSize();
    buildScene();
    if (!reduced) raf = requestAnimationFrame(tick);
    else {
      // Статичный кадр без движения
      drawBackground();
      for (const p of pipes) drawPipe(p);
      for (const j of joints) drawJoint(j);
      drawRuptures(0);
    }

    /* ---------- Хендлеры ---------- */
    const onResize = () => {
      setSize();
      buildScene();
      if (reduced) {
        drawBackground();
        for (const p of pipes) drawPipe(p);
        for (const j of joints) drawJoint(j);
        drawRuptures(0);
      }
    };
    window.addEventListener("resize", onResize);

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX - W / 2;
      mouse.y = e.clientY - H / 2;
    };
    if (!reduced) window.addEventListener("pointermove", onMove);

    /* ---------- GSAP анимации ---------- */
    const gsapCtx = gsap.context(() => {
      const digits = root.querySelector<HTMLHeadingElement>(`.${styles.digits}`);
      gsap.set(
        [
          `.${styles.code}`,
          `.${styles.digits}`,
          `.${styles.sub}`,
          `.${styles.btn}`,
          `.${styles.quick}`,
        ],
        { autoAlpha: 0, y: 40 },
      );

      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.9 } });
      tl.to(`.${styles.code}`, { autoAlpha: 1, y: 0 })
        .to(`.${styles.digits}`, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1 }, "-=0.55")
        .to(`.${styles.sub}`, { autoAlpha: 1, y: 0 }, "-=0.65")
        .to(`.${styles.btn}`, { autoAlpha: 1, y: 0 }, "-=0.65")
        .to(`.${styles.quick}`, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.55");

      if (!reduced && digits) {
        // Дыхание цифр
        gsap.to(digits, {
          scale: 1.02,
          filter: "drop-shadow(0 28px 70px rgba(59, 130, 246, 0.6))",
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // Периодический глитч
        const glitchOnce = () => {
          const master = gsap.timeline({
            onStart: () => digits.classList.add(styles.digitsGlitch),
            onComplete: () => digits.classList.remove(styles.digitsGlitch),
          });
          master
            .to(digits, { x: -6, skewX: 8, duration: 0.05 })
            .to(digits, { x: 6, skewX: -6, duration: 0.05 })
            .to(digits, { x: -3, skewX: 4, duration: 0.05 })
            .to(digits, { x: 0, skewX: 0, duration: 0.05 });
        };
        const glitchLoop = gsap.timeline({ repeat: -1, repeatDelay: 3.5 });
        glitchLoop.add(glitchOnce, 2);
      }
    }, root);

    /* ---------- Cleanup ---------- */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      gsapCtx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.code}>
          <span className={styles.dot} />
          Авария в магистрали · P&nbsp;&gt;&nbsp;4.04&nbsp;MPa
        </div>

        <h1 className={styles.digits} data-text="404">404</h1>

        <p className={styles.sub}>
          Сегмент <b>не подключён</b> к системе или был демонтирован.
          <br />
          Проверьте адрес или вернитесь в главный узел управления.
        </p>

        <Link href="/" className={styles.btn}>
          <span>Вернуться на главную</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <nav className={styles.quick} aria-label="Быстрые ссылки">
          <Link href="/shop" className={styles.quickLink}>Каталог</Link>
          <Link href="/category/otoplenie" className={`${styles.quickLink} ${styles.quickHot}`}>
            Отопление
          </Link>
          <Link href="/category/holodosnabzhenie" className={`${styles.quickLink} ${styles.quickCold}`}>
            Холодоснабжение
          </Link>
          <Link href="/category/vodosnabzhenie" className={styles.quickLink}>Водоснабжение</Link>
          <Link href="/contacts" className={styles.quickLink}>Контакты</Link>
        </nav>
      </div>

      <div className={styles.legend} aria-hidden="true">
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotHot}`} />
          Отопление
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotCold}`} />
          Холодоснабжение
        </div>
      </div>
    </div>
  );
}
