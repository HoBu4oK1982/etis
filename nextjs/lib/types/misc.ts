export type Brand = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  position: number;
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  content?: string | null;
  meta: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  created_at: string | null;
};

export type Slider = {
  id: number;
  /** Плашка над заголовком: "ОБОРУДОВАНИЕ. ИНЖИНИРИНГ. НАДЁЖНОСТЬ." */
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  image: string | null;
  position: number;
};
