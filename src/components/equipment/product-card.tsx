"use client";

import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    nameTh?: string | null;
    description?: string | null;
    images: string[];
    category: {
      name: string;
      nameTh: string;
    };
    fromPrice: number;
    offeringCount: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const href = `/products/${product.slug}`;
  const title = product.nameTh || product.name;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
      {/* Cyan top bar with category + shop count */}
      <div className="flex items-center justify-between bg-brand px-3 py-2 text-brand-foreground">
        <span className="truncate text-xs font-medium">
          {product.category.nameTh}
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-foreground/20 px-2 py-0.5 text-[11px] font-semibold">
          <Store className="h-3 w-3" />
          {product.offeringCount}
        </span>
      </div>

      {/* Image */}
      <Link href={href} className="relative aspect-square overflow-hidden bg-muted">
        <ImageWithFallback
          src={product.images[0]}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 220px"
        />
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-tight transition-colors group-hover:text-brand">
            {title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="leading-tight">
            <span className="text-lg font-bold text-brand">
              {formatPrice(product.fromPrice)}
            </span>
            <span className="ml-0.5 text-xs text-muted-foreground">/ เดือน</span>
          </div>
          <Link
            href={href}
            aria-label={`ดูรายละเอียด ${title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
