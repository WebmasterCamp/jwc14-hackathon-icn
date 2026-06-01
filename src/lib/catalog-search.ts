import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Retrieval layer for the AI assistant (the "R" in RAG).
 *
 * Given a free-text project description, find candidate catalog Products to feed
 * the LLM as grounding context. Strategy: tokenize the query and match against
 * the catalog's text fields / curriculum / category. If too few hits, fall back
 * to the full active catalog (it's small) so the model always has something to
 * recommend from. This is the natural upgrade point for embeddings later.
 */

// A Product is only publicly recommendable if it has at least one active
// offering from a verified provider (mirrors getProductBySlug in queries.ts).
const PUBLIC_OFFERING_FILTER = {
  isActive: true,
  provider: { verified: true },
} satisfies Prisma.EquipmentWhereInput;

export interface CatalogCandidate {
  slug: string;
  name: string;
  nameTh: string | null;
  description: string | null;
  images: string[];
  curriculum: string[];
  categoryName: string; // Thai category label for display + context
  fromPrice: number; // cheapest active offering / month
  offeringCount: number;
}

const MAX_CANDIDATES = 30;
const FALLBACK_LIMIT = 40;
const MIN_HITS_BEFORE_FALLBACK = 3;

// Split a natural-language query into useful tokens (Thai + Latin, len >= 2).
// We keep it deliberately simple — no Thai word segmentation — and rely on
// substring `contains` matching plus the full-catalog fallback.
function tokenize(query: string): string[] {
  const cleaned = query.replace(/[^\p{L}\p{N}\s]/gu, " ");
  const seen = new Set<string>();
  for (const raw of cleaned.split(/\s+/)) {
    const t = raw.trim().toLowerCase();
    if (t.length >= 2) seen.add(t);
  }
  return Array.from(seen).slice(0, 12);
}

type ProductWithOfferings = Prisma.ProductGetPayload<{
  include: {
    category: { select: { nameTh: true; name: true } };
    equipment: { select: { rentPriceMonthly: true } };
  };
}>;

function toCandidate(p: ProductWithOfferings): CatalogCandidate {
  const prices = p.equipment.map((e) => e.rentPriceMonthly);
  return {
    slug: p.slug,
    name: p.name,
    nameTh: p.nameTh,
    description: p.descriptionTh || p.description,
    images: p.images,
    curriculum: p.curriculum,
    categoryName: p.category.nameTh || p.category.name,
    fromPrice: prices.length ? Math.min(...prices) : 0,
    offeringCount: prices.length,
  };
}

export async function searchCatalogProducts(
  query: string
): Promise<CatalogCandidate[]> {
  const tokens = tokenize(query);

  const include = {
    category: { select: { nameTh: true, name: true } },
    equipment: {
      where: PUBLIC_OFFERING_FILTER,
      select: { rentPriceMonthly: true },
    },
  } satisfies Prisma.ProductInclude;

  // Base: only products that have a publicly available offering.
  const baseWhere: Prisma.ProductWhereInput = {
    isActive: true,
    equipment: { some: PUBLIC_OFFERING_FILTER },
  };

  let products: ProductWithOfferings[] = [];

  if (tokens.length > 0) {
    const or: Prisma.ProductWhereInput[] = tokens.flatMap((t) => [
      { name: { contains: t, mode: "insensitive" } },
      { nameTh: { contains: t, mode: "insensitive" } },
      { description: { contains: t, mode: "insensitive" } },
      { descriptionTh: { contains: t, mode: "insensitive" } },
      { brand: { contains: t, mode: "insensitive" } },
      { model: { contains: t, mode: "insensitive" } },
      { curriculum: { has: t } },
      { category: { nameTh: { contains: t, mode: "insensitive" } } },
      { category: { name: { contains: t, mode: "insensitive" } } },
    ]);

    products = await prisma.product.findMany({
      where: { ...baseWhere, OR: or },
      include,
      take: MAX_CANDIDATES,
      orderBy: { updatedAt: "desc" },
    });
  }

  // Fallback: too few keyword hits → give the model the broader active catalog.
  if (products.length < MIN_HITS_BEFORE_FALLBACK) {
    products = await prisma.product.findMany({
      where: baseWhere,
      include,
      take: FALLBACK_LIMIT,
      orderBy: { updatedAt: "desc" },
    });
  }

  return products.map(toCandidate);
}
