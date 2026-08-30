import { Logo } from "@/components/layout/Logo";

type Props = {
  /** Высота логотипа в px (ширина считается по пропорции 2.74:1) */
  size?: number;
  /** Подпись «нет фото» под логотипом */
  caption?: boolean;
};

/**
 * Заглушка вместо фото товара.
 *
 * Вместо надписи «нет фото» — еле заметный логотип из шапки: карточка
 * не выглядит сломанной, а пустое место работает на бренд. Прозрачность
 * держим низкой (см. .etis-nophoto__logo), чтобы заглушка не спорила
 * с реальными фотографиями соседних карточек в сетке.
 */
export function NoPhoto({ size = 92, caption = true }: Props) {
  return (
    <div className="etis-nophoto" role="img" aria-label="Фото товара отсутствует">
      <Logo size={size} className="etis-nophoto__logo" />
      {caption && <span className="etis-nophoto__caption">нет фото</span>}
    </div>
  );
}
