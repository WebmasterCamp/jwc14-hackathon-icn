import Link from "next/link";
import { ProductCard } from "@/components/equipment/product-card";
import { SectionHeading } from "@/components/home/section-heading";
import type { getCategories, getFeaturedProducts } from "@/lib/queries";

interface RecommendedProductsProps {
  categories: Awaited<ReturnType<typeof getCategories>>;
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
}

export function RecommendedProducts({
  categories,
  products,
}: RecommendedProductsProps) {
  return (
    <section className="bg-brand-soft py-20">
      <div className="container mx-auto px-4">
        <SectionHeading>รายการสินค้าแนะนำ</SectionHeading>

        {/* Category filter cards */}
        <div className="mb-10 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/product?category=${cat.slug}`}
              className="flex shrink-0 snap-start items-center gap-2 rounded-xl border bg-card px-5 py-3 text-sm font-medium shadow-sm transition-colors hover:border-brand hover:text-brand"
            >
              <span className="text-base leading-none">{cat.icon || "📦"}</span>
              {cat.nameTh || cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Full-bleed horizontal product scroller */}
      {products.length > 0 && (
        <div className="flex snap-x gap-4 overflow-x-auto px-4 pb-4 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product) => (
            <div key={product.slug} className="w-52 shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
