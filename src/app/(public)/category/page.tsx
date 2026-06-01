import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300; // ISR: revalidate every 5 minutes

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  title: "หมวดหมู่สินค้า",
  description:
    "เลือกชมอุปกรณ์ IoT และ STEM ตามหมวดหมู่ Arduino, หุ่นยนต์, เครื่องพิมพ์ 3D, โดรน และอีกมากมาย",
  alternates: { canonical: `${SITE_URL}/category` },
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/product?category=${cat.slug}`}
              className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-xl"
            >
              {/* Background image (behind the text) */}
              <Image
                src={cat.image || "/assets/placeholder.png"}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark gradient overlay keeps text readable on any image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

              {/* Foreground content */}
              <div className="relative">
                <span className="mb-2 inline-block text-4xl drop-shadow">
                  {cat.icon || "📦"}
                </span>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">
                  {cat.nameTh || cat.name}
                </h2>
                {cat.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/85">
                    {cat.description}
                  </p>
                )}
                <Badge
                  variant="secondary"
                  className="mt-3 bg-white/90 text-slate-900 hover:bg-white"
                >
                  {cat._count.products} รายการ
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
