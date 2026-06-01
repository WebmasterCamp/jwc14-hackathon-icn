import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";

export const revalidate = 300; // ISR: revalidate every 5 minutes
import { EquipmentCard } from "@/components/equipment/equipment-card";
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

  const where = {
    isActive: true,
    ...(searchParams.category && {
      category: {
        slug: searchParams.category,
      },
    }),
    ...(searchParams.province && {
      provider: {
        province: searchParams.province,
      },
    }),
    ...(searchParams.minPrice && {
      rentPriceMonthly: {
        gte: parseFloat(searchParams.minPrice),
      },
    }),
    ...(searchParams.maxPrice && {
      rentPriceMonthly: {
        lte: parseFloat(searchParams.maxPrice),
      },
    }),
    ...(searchParams.search && {
      OR: [
        { name: { contains: searchParams.search, mode: "insensitive" as const } },
        { nameTh: { contains: searchParams.search, mode: "insensitive" as const } },
        { description: { contains: searchParams.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [equipment, totalCount, categories] = await Promise.all([
    prisma.equipment.findMany({
      where,
      include: {
        category: true,
        provider: {
          select: {
            companyName: true,
            province: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.equipment.count({ where }),
    getCategories(), // Use cached query
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      {equipment.length > 0 && (
        <JsonLd
          data={generateItemListSchema(
            equipment.map((item) => ({
              id: item.id,
              name: item.name,
              nameTh: item.nameTh ?? undefined,
              images: item.images,
              rentPriceMonthly: item.rentPriceMonthly,
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
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
                        ? "bg-primary text-primary-foreground"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">อุปกรณ์ทั้งหมด</h1>
        <p className="text-muted-foreground">
          ค้นหาอุปกรณ์ IoT และ STEM สำหรับการเรียนการสอน
        </p>
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
