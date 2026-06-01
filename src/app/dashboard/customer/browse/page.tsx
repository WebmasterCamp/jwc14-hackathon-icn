import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/queries";
import { EquipmentFilters } from "@/components/equipment/equipment-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerBrowseClient } from "@/components/customer/customer-browse-client";

export const dynamic = "force-dynamic";

interface CustomerBrowsePageProps {
  searchParams: Promise<{
    category?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  }>;
}

async function CustomerEquipmentList({
  searchParams,
}: {
  searchParams: {
    category?: string;
    province?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };
}) {
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
        { descriptionTh: { contains: searchParams.search, mode: "insensitive" as const } },
      ],
    }),
  };

  const equipment = await prisma.equipment.findMany({
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
  });

  return <CustomerBrowseClient equipment={equipment} />;
}

function EquipmentListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-lg border bg-card p-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CustomerBrowsePage({
  searchParams,
}: CustomerBrowsePageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ค้นหาอุปกรณ์</h1>
        <p className="text-muted-foreground">
          เลือกอุปกรณ์ IoT และ STEM แล้วคำนวณรายการเช่าในรถเข็น
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full lg:w-64 lg:shrink-0">
          <EquipmentFilters categories={categories} basePath="/dashboard/customer/browse" />
        </aside>

        <main className="min-w-0 flex-1">
          <Suspense fallback={<EquipmentListSkeleton />}>
            <CustomerEquipmentList searchParams={params} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
