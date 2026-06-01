import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300; // ISR: revalidate every 5 minutes

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  title: "หมวดหมู่สินค้า",
  description:
    "เลือกชมอุปกรณ์ IoT และ STEM ตามหมวดหมู่ Arduino, หุ่นยนต์, เครื่องพิมพ์ 3D, โดรน และอีกมากมาย",
  alternates: { canonical: `${SITE_URL}/categorise` },
};

export default async function CategorisePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.brand/25),transparent_60%)]" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            หมวดหมู่สินค้า
          </h1>
          <p className="mt-2 text-lg text-white/80">
            เลือกชมอุปกรณ์ตามหมวดหมู่ที่คุณสนใจ
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">ยังไม่มีหมวดหมู่</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/equipment?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-2xl border bg-card p-6 text-center transition-colors hover:border-brand hover:bg-accent"
            >
              <span className="mb-3 text-4xl">{cat.icon || "📦"}</span>
              <span className="font-semibold group-hover:text-brand">
                {cat.nameTh || cat.name}
              </span>
              {cat.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {cat.description}
                </p>
              )}
              <Badge variant="secondary" className="mt-3">
                {cat._count.products} รายการ
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
