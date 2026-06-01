/**
 * One-time backfill: give every existing Equipment a canonical Product.
 *
 * Before this change Equipment carried its own identity. We now split identity
 * (Product) from the per-provider offering (Equipment). This creates one
 * Product per existing Equipment (no auto-merge of legacy rows — that can be a
 * later admin tool) and links them via Equipment.productId.
 *
 * Idempotent: products are upserted by matchKey, and equipment already carrying
 * a productId is skipped. Run with: npx tsx --env-file=.env prisma/backfill-products.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { buildMatchKey, buildProductSlug } from "../src/lib/product-match";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const equipment = await prisma.equipment.findMany({
    // productId is required in the schema, but legacy rows can still be empty at
    // the DB level before this one-time backfill runs; cast to query for them.
    where: { productId: null as unknown as string },
  });

  console.log(`Backfilling ${equipment.length} equipment row(s)...`);

  for (const eq of equipment) {
    const matchKey = buildMatchKey({ name: eq.name, nameTh: eq.nameTh });

    // Reuse an existing product with the same matchKey if one already exists.
    const existing = await prisma.product.findUnique({ where: { matchKey } });

    const product =
      existing ??
      (await prisma.product.create({
        data: {
          categoryId: eq.categoryId,
          slug: buildProductSlug(eq.name, eq.id),
          matchKey,
          name: eq.name,
          nameTh: eq.nameTh,
          description: eq.description,
          descriptionTh: eq.descriptionTh,
          images: eq.images,
          specs: eq.specs ?? undefined,
          curriculum: eq.curriculum,
          isActive: eq.isActive,
        },
      }));

    await prisma.equipment.update({
      where: { id: eq.id },
      data: { productId: product.id },
    });

    console.log(`  ${eq.name} -> product ${product.slug}`);
  }

  const remaining = await prisma.equipment.count({
    where: { productId: null as unknown as string },
  });
  console.log(`Done. Equipment still missing productId: ${remaining}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
