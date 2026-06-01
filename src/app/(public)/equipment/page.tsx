import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";

export const revalidate = 300; // ISR: revalidate every 5 minutes
import { ProductCard } from "@/components/equipment/product-card";
import { EquipmentFilters } from "@/components/equipment/equipment-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { JsonLd } from "@/components/seo/json-ld";
import { generateItemListSchema } from "@/lib/structured-data";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  title: "อุปกรณ์ทั้งหมด",
  description:
    "ค้นหาและเช่าอุปกรณ์ IoT และ STEM สำหรับการเรียนการสอน Arduino, หุ่นยนต์, เครื่องพิมพ์ 3D, โดรน และอีกมากมาย",
  alternates: { canonical: `${SITE_URL}/equipment` },
};

interface EquipmentPageProps {
  searchParams: Promise<{
    category?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  }>;
}

async function EquipmentList({
  searchParams,
}: {
  searchParams: {
    category?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 12;

  // An offering (Equipment) is publicly visible if it's active and from a
  // verified provider. Province/price filters narrow which offerings count.
  const offeringFilter = {
    isActive: true,
    provider: {
      verified: true,
      ...(searchParams.province && { province: searchParams.province }),
    },
    ...(searchParams.minPrice && {
      rentPriceMonthly: { gte: parseFloat(searchParams.minPrice) },
    }),
    ...(searchParams.maxPrice && {
      rentPriceMonthly: { lte: parseFloat(searchParams.maxPrice) },
    }),
  };

  // List one card per Product, only when it has at least one visible offering.
  const where = {
    isActive: true,
    equipment: { some: offeringFilter },
    ...(searchParams.category && {
      category: { slug: searchParams.category },
    }),
    ...(searchParams.search && {
      OR: [
        { name: { contains: searchParams.search, mode: "insensitive" as const } },
        { nameTh: { contains: searchParams.search, mode: "insensitive" as const } },
        { description: { contains: searchParams.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        equipment: {
          where: offeringFilter,
          select: { rentPriceMonthly: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    getCategories(), // Use cached query
  ]);

  // Collapse each product's visible offerings into a from-price + shop count.
  const equipment = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    nameTh: p.nameTh,
    description: p.descriptionTh || p.description,
    images: p.images,
    category: p.category,
    offeringCount: p.equipment.length,
    fromPrice: p.equipment.reduce(
      (min, o) => Math.min(min, o.rentPriceMonthly),
      Infinity
    ),
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      {equipment.length > 0 && (
        <JsonLd
          data={generateItemListSchema(
            equipment.map((item) => ({
              slug: item.slug,
              name: item.name,
              nameTh: item.nameTh ?? undefined,
              images: item.images,
              fromPrice: item.fromPrice,
            }))
          )}
        />
      )}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          พบ <span className="font-medium text-foreground">{totalCount}</span> รายการ
        </p>
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {equipment.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <a
                    key={p}
                    href={`/equipment?${new URLSearchParams({
                      ...searchParams,
                      page: p.toString(),
                    }).toString()}`}
                    className={`px-4 py-2 rounded-lg ${
                      p === page
                        ? "bg-brand text-brand-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {p}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </>
      )}
    </>
  );
}

function EquipmentListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function EquipmentPage({ searchParams }: EquipmentPageProps) {
  const params = await searchParams;
  const categories = await getCategories(); // Use cached query

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.brand/25),transparent_60%)]" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            อุปกรณ์ทั้งหมด
          </h1>
          <p className="mt-2 text-lg text-white/80">
            เริ่มต้นเพียงวันละ 10 บาทเท่านั้น
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <EquipmentFilters categories={categories} />
        </aside>

        <main className="flex-1">
          <Suspense fallback={<EquipmentListSkeleton />}>
            <EquipmentList searchParams={params} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
