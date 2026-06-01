import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Cached expensive aggregation queries using Next.js unstable_cache.
 * These functions cache results at the server level with configurable revalidation.
 */

// Get platform-wide statistics for admin dashboard
export const getPlatformStats = unstable_cache(
  async () => {
    const [
      totalUsers,
      totalProviders,
      totalCustomers,
      totalEquipment,
      activeContracts,
      pendingProviders,
      contractsByStatus,
      paymentsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.customer.count(),
      prisma.equipment.count({ where: { isActive: true } }),
      prisma.contract.count({ where: { status: "ACTIVE" } }),
      prisma.provider.count({ where: { verified: false } }),
      prisma.contract.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ["status"],
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      totalUsers,
      totalProviders,
      totalCustomers,
      totalEquipment,
      activeContracts,
      pendingProviders,
      contractsByStatus,
      paymentsByStatus,
    };
  },
  ["platform-stats"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["platform-stats"],
  }
);

// Get equipment count by category
export const getEquipmentCountByCategory = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            equipment: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameTh: cat.nameTh,
      slug: cat.slug,
      count: cat._count.equipment,
    }));
  },
  ["equipment-count-by-category"],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["equipment-count-by-category"],
  }
);

// Get provider statistics
export const getProviderStats = unstable_cache(
  async (providerId: string) => {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        equipment: { where: { isActive: true } },
        contracts: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!provider) return null;

    const totalEquipment = provider.equipment.length;
    const totalStock = provider.equipment.reduce((sum, eq) => sum + eq.stock, 0);
    const rentedStock = provider.equipment.reduce(
      (sum, eq) => sum + (eq.stock - eq.availableStock),
      0
    );
    const utilizationRate = totalStock > 0 ? (rentedStock / totalStock) * 100 : 0;

    const activeContracts = provider.contracts.filter(
      (c) => c.status === "ACTIVE"
    ).length;
    const totalRevenue = provider.contracts.reduce(
      (sum, c) =>
        sum +
        c.payments
          .filter((p) => p.status === "PAID")
          .reduce((s, p) => s + p.amount, 0),
      0
    );

    return {
      totalEquipment,
      totalStock,
      rentedStock,
      utilizationRate,
      activeContracts,
      totalRevenue,
    };
  },
  ["provider-stats"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["provider-stats"],
  }
);
