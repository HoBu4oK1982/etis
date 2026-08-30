import { PhoneIcon, MailIcon, LocationIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { HeaderAuthActions } from "./HeaderAuthActions";

/**
 * Верхняя полоса шапки — контакты слева, тема/вход/регистрация справа.
 *
 * Раньше здесь были border-b между полосами и вертикальные разделители
 * между иконками (w-px h-5 bg-[var(--border)]). На белом фоне они читались
 * как чёрные тонкие линии — убрал полностью, оставил только пробел gap.
 */
export function HeaderTopBar() {
  return (
    <div className="bg-[var(--header-bg)] transition-colors">
      <div className="container-narrow flex items-center h-14">
        {/* Левая группа — контакты */}
        <div className="flex items-center gap-6 md:gap-10 flex-1 min-w-0">
          <a
            href="tel:+77273280575"
            className="flex items-center gap-2.5 text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            <span className="text-[var(--accent)] shrink-0">
              <PhoneIcon size={20} />
            </span>
            <span className="text-sm font-medium whitespace-nowrap">+7 (727) 328 05 75</span>
          </a>

          <a
            href="mailto:info@etis.kz"
            className="hidden sm:flex items-center gap-2.5 text-[var(--text)] hover:text-[var(--accent)] transition-colors"
          >
            <span className="text-[var(--accent)] shrink-0">
              <MailIcon size={20} />
            </span>
            <span className="text-sm font-medium">info@etis.kz</span>
          </a>

          <div className="hidden md:flex items-center gap-2.5 text-[var(--text)]">
            <span className="text-[var(--accent)] shrink-0">
              <LocationIcon size={20} />
            </span>
            <span className="text-sm font-medium">Алматы, Казахстан</span>
          </div>
        </div>

        {/* Правая группа — Тема, Вход, Регистрация */}
        <div className="flex items-center gap-6 shrink-0">
          <ThemeToggle />

          <HeaderAuthActions />
        </div>
      </div>
    </div>
  );
}
