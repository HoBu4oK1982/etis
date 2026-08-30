"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Heart,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Logo } from "@/components/layout/Logo";
import {
  getAccountOrder,
  getAccountOrders,
  getAccountProfile,
  updateAccountPassword,
  updateAccountProfile,
  type AccountOrder,
  type AccountProfile,
} from "@/lib/api/account";
import {
  clearAuth,
  getStoredToken,
  logoutUser,
  updateStoredUser,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useCart } from "@/lib/stores/cart";
import { useCompare } from "@/lib/stores/compare";
import { useWishlist } from "@/lib/stores/wishlist";
import { formatPrice } from "@/lib/utils/price";
import { AccountCanvas } from "./AccountCanvas";
import "./account.css";

type AccountMode = "dashboard" | "profile" | "orders";
type Notice = { type: "success" | "error"; text: string } | null;

const STATUS: Record<string, { label: string; className: string; icon: typeof Clock3 }> = {
  ordered: { label: "Принят", className: "is-new", icon: Clock3 },
  delivered: { label: "Выполнен", className: "is-done", icon: CheckCircle2 },
  canceled: { label: "Отменён", className: "is-cancel", icon: XCircle },
};

function dateText(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ET";
}

function apiMessage(error: unknown) {
  const api = error as ApiError;
  const body = (api.body || {}) as { message?: string; errors?: Record<string, string[]> };
  const first = body.errors ? Object.values(body.errors)[0]?.[0] : null;
  return first || body.message || "Не удалось выполнить запрос.";
}

export function AccountExperience({ mode }: { mode: AccountMode }) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      sessionStorage.setItem("etis-auth-return", mode === "dashboard" ? "/account" : `/account/${mode}`);
      router.replace("/login");
      return;
    }

    getAccountProfile(token)
      .then(({ data }) => {
        setProfile(data);
        updateStoredUser({ id: data.id, name: data.name, email: data.email, phone: data.phone, city: data.city });
      })
      .catch((error) => {
        const api = error as ApiError;
        if (api.status === 401) {
          clearAuth();
          router.replace("/login");
        } else {
          setFatal("Не удалось загрузить личный кабинет. Проверьте соединение с сервером.");
        }
      })
      .finally(() => setLoading(false));
  }, [mode, router]);

  useEffect(() => {
    if (loading || !rootRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(".etis-account-animate", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, stagger: .065, ease: "power3.out" });
    }, rootRef);
    return () => context.revert();
  }, [loading, mode]);

  const logout = async () => {
    const token = getStoredToken();
    try { if (token) await logoutUser(token); } catch { /* локальный выход обязателен */ }
    clearAuth();
    router.push("/");
  };

  if (loading) {
    return <div className="etis-account-loader"><span /><span /><span /></div>;
  }

  if (fatal || !profile) {
    return <section className="etis-account-fatal"><ShieldCheck size={42} /><h1>Кабинет временно недоступен</h1><p>{fatal}</p><button onClick={() => location.reload()}><RefreshCw size={16} /> Повторить</button></section>;
  }

  const title = mode === "dashboard" ? "Личный кабинет" : mode === "profile" ? "Профиль и данные" : "История заказов";

  return (
    <section ref={rootRef} className="etis-account-page">
      <div className="container-narrow">
        <nav className="etis-account-breadcrumbs" aria-label="Хлебные крошки">
          <Link href="/">Главная</Link><ArrowRight size={13} />
          {mode !== "dashboard" && <><Link href="/account">Личный кабинет</Link><ArrowRight size={13} /></>}
          <span>{title}</span>
        </nav>

        <section className="etis-account-hero etis-account-animate">
          <AccountCanvas />
          <div className="etis-account-hero__copy">
            <div className="etis-account-eyebrow"><span /> КОНТРОЛЬ. ИСТОРИЯ. СЕРВИС.</div>
            <h1>{title}</h1>
            <p>{mode === "dashboard" ? "Заказы, сохранённые позиции и данные для быстрого оформления — в одном месте." : mode === "profile" ? "Обновляйте контактные данные и безопасность аккаунта ETIS.KZ." : "Следите за заявками и открывайте подробный состав каждого заказа."}</p>
          </div>
          <div className="etis-account-hero__user"><div className="etis-account-avatar">{initials(profile.name)}</div><div><span>Покупатель ETIS.KZ</span><b>{profile.name}</b><small>{profile.email}</small></div><div className="etis-account-hero__logo"><Logo size={26} /></div></div>
        </section>

        {mode === "dashboard" ? <Dashboard profile={profile} onLogout={logout} /> : mode === "profile" ? <Profile profile={profile} onProfile={setProfile} /> : <Orders />}
      </div>
    </section>
  );
}

function Dashboard({ profile, onLogout }: { profile: AccountProfile; onLogout: () => void }) {
  const cartQty = useCart((s) => s.totalQty());
  const wishCount = useWishlist((s) => s.items.length);
  const compareCount = useCompare((s) => s.items.length);
  const memberSince = profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();

  const cards = [
    { href: "/account/orders", icon: PackageCheck, title: "Мои заказы", text: "История заявок и их текущие статусы", meta: "Открыть историю" },
    { href: "/account/profile", icon: CircleUserRound, title: "Профиль", text: "Контакты, адрес и пароль аккаунта", meta: "Изменить данные" },
    { href: "/cart", icon: ShoppingCart, title: "Корзина", text: "Продолжить формирование комплекта", meta: `${cartQty} шт.` },
    { href: "/favourite", icon: Heart, title: "Избранное", text: "Сохранённое инженерное оборудование", meta: `${wishCount} позиций` },
    { href: "/compare", icon: Scale, title: "Сравнение", text: "Сопоставить технические параметры", meta: `${compareCount} позиций` },
    { href: "/contacts", icon: Phone, title: "Связаться с ETIS", text: "Помощь инженера и консультация", meta: "+7 (727) 328 05 75" },
  ];

  return (
    <div className="etis-account-dashboard">
      <section className="etis-account-user-card etis-account-animate">
        <div className="etis-account-user-card__avatar">{initials(profile.name)}</div>
        <div className="etis-account-user-card__body"><span>Добро пожаловать</span><h2>{profile.name}</h2><div><small><Mail size={14} /> {profile.email}</small>{profile.phone && <small><Phone size={14} /> {profile.phone}</small>}{profile.city && <small><MapPin size={14} /> {profile.city}</small>}</div></div>
        <div className="etis-account-user-card__since"><CalendarDays size={18} /><span>Клиент с {memberSince} года</span></div>
        <button type="button" onClick={onLogout}><LogOut size={16} /> Выйти</button>
      </section>
      <div className="etis-account-grid">
        {cards.map(({ href, icon: Icon, title, text, meta }) => <Link key={href} href={href} className="etis-account-nav-card etis-account-animate"><span className="etis-account-nav-card__icon"><Icon size={25} /></span><div><h3>{title}</h3><p>{text}</p><b>{meta}</b></div><ArrowRight size={20} /></Link>)}
      </div>
      <section className="etis-account-support etis-account-animate"><div><Sparkles size={25} /></div><span><b>Нужен подбор оборудования?</b>Отправьте параметры объекта — инженер проверит совместимость и соберёт комплект.</span><Link href="/contacts">Получить консультацию <ArrowRight size={16} /></Link></section>
    </div>
  );
}

function Profile({ profile, onProfile }: { profile: AccountProfile; onProfile: (profile: AccountProfile) => void }) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || "");
  const [city, setCity] = useState(profile.city || "");
  const [address, setAddress] = useState(profile.address || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const token = getStoredToken(); if (!token) return;
    setSaving(true); setNotice(null);
    try {
      const { data } = await updateAccountProfile(token, { name, email, phone: phone || null, city: city || null, address: address || null });
      onProfile(data);
      updateStoredUser({ id: data.id, name: data.name, email: data.email, phone: data.phone, city: data.city });
      setNotice({ type: "success", text: "Контактные данные сохранены." });
    } catch (error) { setNotice({ type: "error", text: apiMessage(error) }); }
    finally { setSaving(false); }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    const token = getStoredToken(); if (!token) return;
    setPasswordSaving(true); setPasswordNotice(null);
    try {
      await updateAccountPassword(token, { current_password: currentPassword, password, password_confirmation: confirmation });
      setCurrentPassword(""); setPassword(""); setConfirmation("");
      setPasswordNotice({ type: "success", text: "Пароль успешно изменён." });
    } catch (error) { setPasswordNotice({ type: "error", text: apiMessage(error) }); }
    finally { setPasswordSaving(false); }
  };

  return (
    <div className="etis-profile-layout">
      <Link href="/account" className="etis-account-back etis-account-animate"><ArrowLeft size={15} /> Назад в кабинет</Link>
      <form onSubmit={saveProfile} className="etis-profile-panel etis-account-animate">
        <div className="etis-profile-panel__title"><span><UserRound size={21} /></span><div><h2>Контактные данные</h2><p>Используются для оформления и связи по заказам</p></div></div>
        <div className="etis-profile-fields">
          <label><span>Имя</span><div><UserRound size={16} /><input value={name} onChange={(e) => setName(e.target.value)} required /></div></label>
          <label><span>E-mail</span><div><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></label>
          <label><span>Телефон</span><div><Phone size={16} /><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div></label>
          <label><span>Город</span><div><Building2 size={16} /><input value={city} onChange={(e) => setCity(e.target.value)} /></div></label>
          <label className="is-wide"><span>Адрес доставки</span><div><MapPin size={16} /><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом, офис" /></div></label>
        </div>
        {notice && <div className={`etis-account-notice ${notice.type}`}>{notice.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{notice.text}</div>}
        <button type="submit" className="etis-profile-submit" disabled={saving}><ShieldCheck size={17} /> {saving ? "Сохраняем…" : "Сохранить изменения"}</button>
      </form>
      <form onSubmit={savePassword} className="etis-profile-panel etis-account-animate">
        <div className="etis-profile-panel__title"><span><KeyRound size={21} /></span><div><h2>Безопасность</h2><p>Изменение пароля личного кабинета</p></div></div>
        <div className="etis-profile-fields is-password">
          <label className="is-wide"><span>Текущий пароль</span><div><KeyRound size={16} /><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div></label>
          <label><span>Новый пароль</span><div><KeyRound size={16} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></div></label>
          <label><span>Повторите пароль</span><div><ShieldCheck size={16} /><input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} minLength={8} required /></div></label>
        </div>
        {passwordNotice && <div className={`etis-account-notice ${passwordNotice.type}`}>{passwordNotice.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{passwordNotice.text}</div>}
        <button type="submit" className="etis-profile-submit is-dark" disabled={passwordSaving}><KeyRound size={17} /> {passwordSaving ? "Обновляем…" : "Изменить пароль"}</button>
      </form>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, AccountOrder>>({});
  const [detailLoading, setDetailLoading] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = (nextPage: number) => {
    const token = getStoredToken(); if (!token) return;
    setLoading(true); setNotice(null); setExpanded(null);
    getAccountOrders(token, nextPage, 10).then(({ data }) => { setOrders(data.items); setPage(data.meta.current_page); setLastPage(data.meta.last_page); }).catch((error) => setNotice(apiMessage(error))).finally(() => setLoading(false));
  };
  useEffect(() => { load(1); }, []);

  const toggle = async (order: AccountOrder) => {
    if (expanded === order.id) { setExpanded(null); return; }
    setExpanded(order.id);
    if (details[order.id]) return;
    const token = getStoredToken(); if (!token) return;
    setDetailLoading(order.id);
    try { const { data } = await getAccountOrder(token, order.id); setDetails((current) => ({ ...current, [order.id]: data })); }
    catch (error) { setNotice(apiMessage(error)); }
    finally { setDetailLoading(null); }
  };

  const totalSpent = useMemo(() => orders.filter((o) => o.status !== "canceled").reduce((sum, order) => sum + order.total, 0), [orders]);

  return (
    <div className="etis-orders-page">
      <Link href="/account" className="etis-account-back etis-account-animate"><ArrowLeft size={15} /> Назад в кабинет</Link>
      <div className="etis-orders-stats etis-account-animate"><div><Package size={22} /><span>Заказов на странице<b>{orders.length}</b></span></div><div><ShoppingCart size={22} /><span>Товаров<b>{orders.reduce((sum,o)=>sum+o.items_count,0)}</b></span></div><div><Sparkles size={22} /><span>Сумма активных<b>{formatPrice(totalSpent)}</b></span></div></div>
      {notice && <div className="etis-account-notice error"><XCircle size={16} />{notice}</div>}
      {loading ? <div className="etis-orders-loading"><RefreshCw size={24} /> Загружаем заказы…</div> : orders.length === 0 ? <div className="etis-orders-empty etis-account-animate"><PackageCheck size={52} /><h2>Заказов пока нет</h2><p>Соберите оборудование в корзине и отправьте первую заявку.</p><Link href="/shop">Перейти в каталог <ArrowRight size={16} /></Link></div> : <div className="etis-orders-list">{orders.map((order) => { const status = STATUS[order.status] || STATUS.ordered; const StatusIcon=status.icon; const open=expanded===order.id; const detail=details[order.id]; return <article key={order.id} className={`etis-order-card etis-account-animate ${open?"is-open":""}`}><button type="button" className="etis-order-card__head" onClick={()=>toggle(order)}><div className="etis-order-card__number"><span><Package size={18} /></span><div><b>Заказ №{order.order_number}</b><small>{dateText(order.created_at)}</small></div></div><div className="etis-order-card__right"><span className={`etis-order-status ${status.className}`}><StatusIcon size={14}/>{status.label}</span><div><b>{formatPrice(order.total)}</b><small>{order.items_count} шт.</small></div><ChevronDown size={19}/></div></button>{open&&<div className="etis-order-detail">{detailLoading===order.id?<div className="etis-order-detail__loading"><RefreshCw size={18}/> Загружаем состав…</div>:detail?<><div className="etis-order-detail__meta"><span><Truck size={16}/>{detail.delivery_type==="pickup"?"Самовывоз":"Доставка"}</span><span><MapPin size={16}/>{detail.address||detail.city||"Адрес уточняется"}</span><span><Phone size={16}/>{detail.customer_phone}</span></div><div className="etis-order-detail__items">{detail.items?.map((item)=><div key={item.id}><div><Link href={item.slug?`/product/${item.slug}`:"#"}>{item.title}</Link><span>{item.qty} × {formatPrice(item.price)}</span></div><b>{formatPrice(item.line_total)}</b></div>)}</div>{detail.comment&&<div className="etis-order-detail__comment"><b>Комментарий</b><span>{detail.comment}</span></div>}<div className="etis-order-detail__total"><span>Итого</span><b>{formatPrice(detail.total)}</b></div></>:<div className="etis-order-detail__loading">Не удалось загрузить состав заказа.</div>}</div>}</article>; })}</div>}
      {lastPage>1&&<div className="etis-orders-pagination">{Array.from({length:lastPage},(_,index)=>index+1).map((item)=><button key={item} type="button" data-active={item===page} onClick={()=>load(item)}>{item}</button>)}</div>}
    </div>
  );
}
