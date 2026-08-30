import { BoilerCanvas } from "./BoilerCanvas";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import "./auth.css";

type Props = {
  breadcrumbLabel: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

/**
 * Обёртка страниц входа и регистрации.
 *
 * Слева — canvas-hero с 3D-котлом и трубами, поверх которого
 * в верхнем левом углу идёт заголовок и описание.
 * Справа — форма.
 */
export function AuthShell({
  breadcrumbLabel,
  title,
  description,
  children,
}: Props) {
  return (
    <div className="container-narrow py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: breadcrumbLabel },
        ]}
      />

      <div className="etis-auth__wrap">
        <aside className="etis-auth__hero">
          <div className="etis-auth__hero-canvas">
            <BoilerCanvas />
          </div>

          <div className="etis-auth__hero-body">
            <h1 className="etis-auth__title">{title}</h1>
            <p className="etis-auth__desc">{description}</p>
          </div>

          <div className="etis-auth__hero-noise" aria-hidden />
        </aside>

        <div className="etis-auth__form-side">{children}</div>
      </div>
    </div>
  );
}
