import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

const createEquipmentSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(2),
  nameTh: z.string().optional(),
  description: z.string().optional(),
  descriptionTh: z.string().optional(),
  images: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.string()).optional(),
  rentPriceMonthly: z.number().positive(),
  leaseToOwnPrice: z.number().positive().optional(),
  leaseDuration: z.number().positive().optional(),
  depositAmount: z.number().min(0).default(0),
  stock: z.number().int().positive().default(1),
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR"]).default("NEW"),
  curriculum: z.array(z.string()).default([]),
});

// POST /api/equipment - Create new equipment (Provider only)
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

    const equipment = await prisma.equipment.create({
      data: {
        ...data,
        providerId: provider.id,
        availableStock: data.stock,
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
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}
