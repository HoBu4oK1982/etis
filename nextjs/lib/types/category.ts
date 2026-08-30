export type Category = {
  id: number;
  title: string;
  /** Подзаголовок под названием (одна строка) */
  subtitle: string | null;
  /** Минитекст / короткое описание (до 500 символов) */
  short_description: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  parent_id: number | null;
  position: number;
  meta: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
};

export type CategoryTreeNode = {
  id: number;
  title: string;
  slug: string;
  parent_id: number | null;
  position: number;
  children: CategoryTreeNode[];
};

export type Breadcrumb = {
  title: string;
  slug: string;
  url: string;
};

export type CategoryPageData = {
  root: Category;
  current: Category;
  path_segments: string[];
  tree: CategoryTreeNode;
  breadcrumbs: Breadcrumb[];
  /** [category_id => количество товаров с учётом поддерева] */
  counts?: Record<string, number>;
};
