import { baseIconProps, type IconProps } from "./base";

export function PhoneIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function MailIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function LocationIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function UserIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/** Сумка с плюсом — для регистрации */
export function BagPlusIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
      <line x1="12" y1="13" x2="12" y2="17" />
      <line x1="10" y1="15" x2="14" y2="15" />
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function HeartIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/** Сумка с ручкой — для корзины */
export function BagIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/** Медалька с процентом — Хиты продаж */
export function MedalPercentIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
      <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11" />
      <line x1="10" y1="9" x2="14" y2="7" />
      <circle cx="10.3" cy="7" r="0.5" fill="currentColor" />
      <circle cx="13.7" cy="9" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** Ярлычок — Новинки */
export function TagIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

/** Процент в круге — Скидки */
export function DiscountIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="16" x2="16" y2="8" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <circle cx="15.5" cy="15.5" r="1.5" />
    </svg>
  );
}

/** Телефон с волнами — Перезвоните мне */
export function PhoneCallIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function ArrowLeftIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function CategoryArrowIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ConsultationIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M21 15a4 4 0 0 1-4 4H9l-5 3v-7a7 7 0 0 1-1-3.5A7.5 7.5 0 0 1 10.5 4H14a7 7 0 0 1 7 7v4Z" />
      <circle cx="9" cy="11.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="13" cy="11.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="17" cy="11.5" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ProjectSelectionIcon(p: IconProps) {
  return (
    <svg {...baseIconProps(p)}>
      <path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 12h7" />
      <path d="M8.5 16h4" />
      <circle cx="18" cy="18" r="3.5" fill="white" />
      <path d="m16.6 18 1 1 1.9-2" />
    </svg>
  );
}
