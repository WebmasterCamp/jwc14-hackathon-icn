import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/products/search?q=&categoryId= - Provider product autocomplete.
// Lets a provider find an existing catalog product to attach an offering to,
// instead of creating a duplicate. Provider-gated (not public).
export async function GET(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(categoryId && { categoryId }),
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { nameTh: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      nameTh: true,
      brand: true,
      model: true,
      images: true,
      category: { select: { nameTh: true, name: true } },
      _count: { select: { equipment: true } },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      nameTh: p.nameTh,
      brand: p.brand,
      model: p.model,
      image: p.images[0] ?? null,
      category: p.category.nameTh || p.category.name,
      offeringCount: p._count.equipment,
    })),
  });
}
