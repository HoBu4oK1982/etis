import Link from "next/link";
import type { PartnerBrand } from "@/lib/types/home";
import { PartnersCarousel } from "./PartnersCarousel";
import { AboutCompanyStats } from "./AboutCompanyStats";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4.1 4.1L19 6.8" />
    </svg>
  );
}

/**
 * Секция «Официальные партнёры» + карточка «О компании».
 *
 * Партнёры отдаются с бэка (GET /api/v1/home → partners), фильтр
 * по image != null уже сделан там же — если бренд без логотипа,
 * его в этой секции не видно. Если партнёров совсем нет, секцию
 * с каруселью не рисуем: пустой заголовок «Официальные партнёры»
 * без содержимого выглядит хуже, чем отсутствие блока.
 */
export function OfficialPartnersSection({ partners }: { partners: PartnerBrand[] }) {
  return (
    <section className="official-partners container-narrow" aria-labelledby="official-partners-title">
      {partners.length > 0 && (
        <>
          <div className="official-partners-heading">
            <h2 id="official-partners-title">Официальные партнёры</h2>
            <Link href="/brands">Смотреть все <span>→</span></Link>
          </div>

          <PartnersCarousel partners={partners} />
        </>
      )}

      <div className="about-company-card">
        <div className="about-company-copy">
          <div className="about-company-eyebrow">О компании <span /></div>
          <h3>ETC — ваш надёжный партнёр<br />в сфере инженерных систем</h3>
          <p>
            Поставляем современное оборудование, выполняем проекты и обеспечиваем
            безупречный сервис. Работая с нами, вы получаете качество, надёжность
            и уверенность в результате.
          </p>

          <ul>
            <li><CheckIcon /><span>Более 10 лет на рынке инженерных решений</span></li>
            <li><CheckIcon /><span>Тысячи реализованных проектов по всему Казахстану</span></li>
            <li><CheckIcon /><span>Сертифицированное оборудование и материалы</span></li>
            <li><CheckIcon /><span>Команда профессионалов и техническая поддержка</span></li>
          </ul>

          <Link className="about-company-button" href="/about">Подробнее о компании</Link>
        </div>

        <div className="about-company-visual" role="img" aria-label="Современная насосная станция">
          <AboutCompanyStats />
        </div>
      </div>
    </section>
  );
}
