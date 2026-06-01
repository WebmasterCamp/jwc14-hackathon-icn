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
 * Customer row — which made every customer dashboard page redirect to /sign-in
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
      where.pricePerDay = {};
      if (filters.minPrice !== undefined) {
        where.pricePerDay.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.pricePerDay.lte = filters.maxPrice;
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
