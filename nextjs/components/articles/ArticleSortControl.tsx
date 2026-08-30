"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ArticleSort } from "@/lib/api/articles";
import { CatalogSelect } from "@/components/catalog/CatalogSelect";

const SORT_OPTIONS = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
];

export function ArticleSortControl({ value }: { value: ArticleSort }) {
  const router = useRouter();
  const pathname = usePathname();

  const changeSort = (nextSort: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete("page");

    if (nextSort === "newest") params.delete("sort");
    else params.set("sort", nextSort);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <CatalogSelect
      value={value}
      options={SORT_OPTIONS}
      onChange={changeSort}
      ariaLabel="Сортировать статьи по дате"
    />
  );
}
