import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { buildMatchKey, buildProductSlug } from "@/lib/product-match";
import { randomUUID } from "crypto";

// GET /api/equipment - List equipment with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const province = searchParams.get("province");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(province && { provider: { province } }),
      ...(minPrice && { rentPriceMonthly: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { rentPriceMonthly: { lte: parseFloat(maxPrice) } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { nameTh: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [equipment, total] = await Promise.all([
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.equipment.count({ where }),
    ]);

    return NextResponse.json({
      equipment,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

// Fields describing a brand-new catalog product (when not attaching to an
// existing one). The shared identity lives on Product.
const newProductSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2),
  nameTh: z.string().optional(),
  description: z.string().optional(),
  descriptionTh: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  images: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.string()).optional(),
  curriculum: z.array(z.string()).default([]),
});

// The per-provider offering: either attach to an existing product (productId)
// or create a new one (newProduct), plus the commercial terms for this shop.
const createEquipmentSchema = z
  .object({
    productId: z.string().optional(),
    newProduct: newProductSchema.optional(),
    rentPriceMonthly: z.number().positive(),
    leaseToOwnPrice: z.number().positive().optional(),
    leaseDuration: z.number().positive().optional(),
    depositAmount: z.number().min(0).default(0),
    stock: z.number().int().positive().default(1),
    condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR"]).default("NEW"),
    insuranceMonths: z.number().int().min(0).optional(),
    conditions: z.string().optional(),
  })
  .refine((d) => Boolean(d.productId) || Boolean(d.newProduct), {
    message: "Either productId or newProduct is required",
  });

// POST /api/equipment - Create new offering (Provider only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    if (!provider.verified) {
      return NextResponse.json(
        { error: "Provider not verified" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = createEquipmentSchema.parse(body);

    // Resolve the catalog product: attach to an existing one, or create/reuse.
    let product;
    if (data.productId) {
      product = await prisma.product.findUnique({
        where: { id: data.productId },
      });
      if (!product) {
        return NextResponse.json(
          { error: "ไม่พบสินค้าที่เลือก" },
          { status: 404 }
        );
      }
    } else {
      const np = data.newProduct!;
      const matchKey = buildMatchKey({
        brand: np.brand,
        model: np.model,
        name: np.name,
        nameTh: np.nameTh,
      });
      // Auto-match safety net: if a product with this normalized key already
      // exists, reuse it rather than create a duplicate.
      product =
        (await prisma.product.findUnique({ where: { matchKey } })) ??
        (await prisma.product.create({
          data: {
            categoryId: np.categoryId,
            slug: buildProductSlug(np.name, randomUUID()),
            matchKey,
            name: np.name,
            nameTh: np.nameTh,
            description: np.description,
            descriptionTh: np.descriptionTh,
            brand: np.brand,
            model: np.model,
            images: np.images,
            specs: np.specs,
            curriculum: np.curriculum,
          },
        }));
    }

    const equipment = await prisma.equipment.create({
      data: {
        providerId: provider.id,
        productId: product.id,
        // Keep legacy denormalized columns populated from the product.
        categoryId: product.categoryId,
        name: product.name,
        nameTh: product.nameTh,
        description: product.description,
        descriptionTh: product.descriptionTh,
        images: product.images,
        specs: product.specs ?? undefined,
        curriculum: product.curriculum,
        rentPriceMonthly: data.rentPriceMonthly,
        leaseToOwnPrice: data.leaseToOwnPrice,
        leaseDuration: data.leaseDuration,
        depositAmount: data.depositAmount,
        stock: data.stock,
        availableStock: data.stock,
        condition: data.condition,
        insuranceMonths: data.insuranceMonths,
        conditions: data.conditions,
      },
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
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    // Unique constraint on (providerId, productId): provider already lists it.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "คุณได้ลงรายการสินค้านี้ไว้แล้ว" },
        { status: 409 }
      );
    }
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}
