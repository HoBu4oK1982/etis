import { useId } from "react";
import "./logo.css";

type Props = {
  className?: string;
  /** Размер (высота) в px. Ширина считается автоматически по aspect ratio исходника. */
  size?: number;
};

/**
 * Логотип etis.kz (ETC) — SVG из CorelDRAW-исходника.
 *
 * Композиция:
 *   - слева: треугольная эмблема-«A» с двумя горизонтальными перемычками
 *   - справа: жирный текст «ETC»
 *
 * На весь логотип наложен единый линейный градиент из #0180cf в правом
 * верхнем углу в #012a6a в левом нижнем — то есть направление 100%,0% → 0%,100%.
 *
 * id градиента генерируется через useId(), чтобы при одновременном рендере
 * <Logo /> в шапке и футере id не конфликтовали.
 *
 * Шрифт: оригинал использует Gilroy (Regular). На фронте etis.kz Gilroy
 * не подключён, поэтому в font-family указан fallback на Inter (основной
 * шрифт проекта) и системный sans-serif. Если захочешь точное соответствие
 * с исходником — подключи Gilroy через next/font или @font-face.
 */
export function Logo({ className, size = 44 }: Props) {
  const gradientId = useId();
  // Исходник viewBox = 4814.76 × 1756.21; соотношение примерно 2.74:1
  const aspectRatio = 4814.76 / 1756.21;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 4814.76 1756.21"
      height={size}
      width={size * aspectRatio}
      className={["etis-logo", className].filter(Boolean).join(" ")}
      role="img"
      aria-label="etis.kz"
    >
      <defs>
        {/*
          Градиент направлен из правого верхнего угла (x=100%, y=0%)
          в левый нижний (x=0%, y=100%). Начало — светлый #0180cf,
          конец — тёмный #012a6a.
        */}
        <linearGradient
          id={gradientId}
          x1="100%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor="var(--etis-logo-gradient-start, #0180cf)" />
          <stop offset="100%" stopColor="var(--etis-logo-gradient-end, #012a6a)" />
        </linearGradient>
      </defs>

      {/* Треугольная эмблема с двумя перемычками */}
      <path
        fill={`url(#${gradientId})`}
        d="M954.03 0l494.43 908.54 -461.8 0 -444.54 847.36 -188.23 0 534.89 -1007.98 281.1 0 -203.29 -396.54 -755.75 1404.84 -210.82 0 954.03 -1756.21zm604.86 1099.28l90.35 198.27 -712.78 0 95.37 -198.27 527.05 0zm-667.6 331.29l30.12 128 888.46 0 87.84 195.76 -1174.02 0 167.6 -323.76z"
      />

      {/* Текст «ETC» */}
      <text
        x="2016.08"
        y="1431.72"
        fontFamily="'Gilroy', 'Inter', system-ui, sans-serif"
        fontWeight="400"
        fontSize="1608.01"
        fill={`url(#${gradientId})`}
      >
        ETC
      </text>
    </svg>
  );
}
