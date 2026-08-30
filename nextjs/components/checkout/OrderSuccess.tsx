"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, Mail, PackageCheck, Phone } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/utils/price";
import "./checkout.css";

export function OrderSuccess() {
  const params = useSearchParams();
  const rootRef = useRef<HTMLElement>(null);
  const order = params.get("order") || "—";
  const total = Number(params.get("total") || 0);
  const created = params.get("account") === "created";

  useEffect(() => {
    if (!rootRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".etis-success__animate", { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.08, ease: "power3.out" });
      gsap.fromTo(".etis-success__check", { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.75, ease: "back.out(2.2)" });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="etis-success-page">
      <div className="container-narrow">
        <div className="etis-success">
          <div className="etis-success__glow" aria-hidden />
          <div className="etis-success__check"><Check size={38} /></div>
          <h1 className="etis-success__animate">Спасибо за заказ!</h1>
          <p className="etis-success__animate">Инженер ETIS.KZ проверит оборудование, наличие и свяжется с вами для подтверждения.</p>
          <div className="etis-success__data etis-success__animate"><div><span>Номер заказа</span><b>{order}</b></div><div><span>Предварительная сумма</span><b>{total > 0 ? formatPrice(total) : "По расчёту"}</b></div></div>
          {created && <div className="etis-success__account etis-success__animate"><Mail size={19} /><span><b>Личный кабинет создан</b>Временный пароль отправлен на указанный e-mail.</span></div>}
          <div className="etis-success__steps etis-success__animate"><div><span>01</span><b>Проверка</b><small>Сверим цены и наличие</small></div><ArrowRight size={17} /><div><span>02</span><b>Связь</b><small>Уточним детали проекта</small></div><ArrowRight size={17} /><div><span>03</span><b>Поставка</b><small>Согласуем сроки и доставку</small></div></div>
          <div className="etis-success__actions etis-success__animate"><Link href="/account/orders"><PackageCheck size={17} /> Мои заказы</Link><Link href="/shop">Вернуться в каталог <ArrowRight size={17} /></Link></div>
          <a href="tel:+77273280575" className="etis-success__phone etis-success__animate"><Phone size={16} /> +7 (727) 328 05 75</a>
        </div>
      </div>
    </section>
  );
}
