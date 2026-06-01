import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Cached query functions using React cache() for request-level deduplication.
 * These functions ensure that identical queries within a single request are only executed once.
 */

/**
 * Ensure a CUSTOMER user has a Customer profile row, creating a placeholder if
 * missing. OAuth sign-ups create the row up front, but accounts created before
 * that fix (or any edge case) would otherwise have a CUSTOMER user with no
 * Customer row — which made every customer dashboard page redirect to /login
 * and loop with the middleware. Calling this before querying the profile makes
 * the dashboard self-healing. The user completes the placeholder details later.
 */
export async function ensureCustomerProfile(
  userId: string,
  name?: string | null
) {
  return prisma.customer.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      schoolName: name ?? "",
      schoolType: "PRIMARY",
    },
  });
}

// Get all categories (used multiple times in equipment pages)
export const getCategories = cache(async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
});

// Featured products for the landing page. Mirrors the offering-collapse
// shaping used by the equipment listing (equipment/page.tsx) so the result
// drops straight into <ProductCard /> without further mapping.
export const getFeaturedProducts = cache(async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      equipment: {
        where: { isActive: true, provider: { verified: true } },
        select: { rentPriceMonthly: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return products.map((p) => ({
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
});

// Get equipment by ID with all relations
export const getEquipmentById = cache(async (id: string) => {
  return prisma.equipment.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              avatar: true,
              phone: true,
            },
          },
        },
      },
    },
  });
});

// Get a catalog product by slug with its active offerings (one per shop).
// Only offerings from verified providers are surfaced publicly.
export const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      equipment: {
        where: { isActive: true, provider: { verified: true } },
        include: {
          provider: {
            include: {
              user: {
                select: { name: true, phone: true, email: true },
              },
            },
          },
        },
        orderBy: { rentPriceMonthly: "asc" },
      },
    },
  });
});

// Map an offering (Equipment) id to its product slug — used for legacy
// /product/[id] redirects.
export const getProductSlugByEquipmentId = cache(async (equipmentId: string) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    select: { product: { select: { slug: true } } },
  });
  return equipment?.product?.slug ?? null;
});

// Get verified providers
export const getVerifiedProviders = cache(async () => {
  return prisma.provider.findMany({
    where: { verified: true },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          avatar: true,
        },
      },
      equipment: {
        where: { isActive: true },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
});

// Get user with role information
export const getUserWithRole = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      provider: true,
      customer: true,
    },
  });
});

// Get equipment with filters (for listing page)
export const getEquipmentList = cache(
  async (filters: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const where: any = {
      isActive: true,
      provider: { verified: true },
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.rentPriceMonthly = {};
      if (filters.minPrice !== undefined) {
        where.rentPriceMonthly.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.rentPriceMonthly.lte = filters.maxPrice;
      }
    }

    return prisma.equipment.findMany({
      where,
      include: {
        category: true,
        provider: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
);
