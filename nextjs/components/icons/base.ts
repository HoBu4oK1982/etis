import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

/**
 * Хелпер для базовых атрибутов SVG-иконки.
 * Все иконки stroke-based (line-icons), 24×24 viewBox.
 */
export function baseIconProps({ size = 24, ...rest }: IconProps) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}
