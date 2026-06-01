import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { EquipmentCard } from "@/components/equipment/equipment-card";
import { EquipmentFilters } from "@/components/equipment/equipment-filters";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

const BASE_PATH = "/dashboard/customer/browse";

interface BrowsePageProps {
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
  searchParams: Awaited<BrowsePageProps["searchParams"]>;
}) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 12;

  const where = {
    isActive: true,
    provider: {
      verified: true,
      ...(searchParams.province && { province: searchParams.province }),
    },
    ...(searchParams.category && {
      category: { slug: searchParams.category },
    }),
    ...(searchParams.minPrice && {
      rentPriceMonthly: { gte: parseFloat(searchParams.minPrice) },
    }),
    ...(searchParams.maxPrice && {
      rentPriceMonthly: { lte: parseFloat(searchParams.maxPrice) },
    }),
    ...(searchParams.search && {
      OR: [
        { name: { contains: searchParams.search, mode: "insensitive" as const } },
        { nameTh: { contains: searchParams.search, mode: "insensitive" as const } },
        {
          description: {
            contains: searchParams.search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),
  };

  const [equipment, totalCount] = await Promise.all([
    prisma.equipment.findMany({
      where,
      include: {
        category: true,
        provider: {
          select: { companyName: true, province: true, rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.equipment.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    href={`${BASE_PATH}?${new URLSearchParams({
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

export default async function CustomerBrowsePage({
  searchParams,
}: BrowsePageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ค้นหาอุปกรณ์</h1>
        <p className="text-muted-foreground">
          ค้นหาอุปกรณ์ IoT และ STEM สำหรับการเรียนการสอน
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <EquipmentFilters categories={categories} basePath={BASE_PATH} />
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
