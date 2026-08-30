import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types/category";

export function CategoryTiles({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-narrow mt-16 md:mt-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Категории</h2>
          <p className="text-ink-600 mt-1">Основные направления оборудования</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="group relative bg-white border border-ink-100 hover:border-brand-500/40 hover:shadow-md rounded-xl p-5 flex flex-col items-center justify-center text-center min-h-[150px] transition-all"
          >
            {c.image ? (
              <div className="relative w-16 h-16 mb-3">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="64px"
                  className="object-contain group-hover:scale-110 transition-transform"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 grid place-items-center mb-3 text-brand-600 font-bold text-xl">
                {c.title.charAt(0)}
              </div>
            )}
            <div className="text-sm font-medium text-ink-900 group-hover:text-brand-600 leading-tight">
              {c.title}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
