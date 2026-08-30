"use client";

type Props = {
  letters: string[];
  active: string | null;
  onSelect: (letter: string | null) => void;
};

/**
 * Полоса букв. Показываем только те буквы, с которых реально
 * начинаются бренды — «мёртвые» кнопки в интерфейсе не нужны.
 */
export function BrandAlphabet({ letters, active, onSelect }: Props) {
  if (letters.length <= 1) return null;

  return (
    <div className="etis-brands__alphabet scrollbar-none" role="group" aria-label="Фильтр по букве">
      <button
        type="button"
        className={`etis-brands__letter${active === null ? " is-active" : ""}`}
        onClick={() => onSelect(null)}
      >
        Все
      </button>

      {letters.map((letter) => (
        <button
          key={letter}
          type="button"
          className={`etis-brands__letter${active === letter ? " is-active" : ""}`}
          onClick={() => onSelect(active === letter ? null : letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
