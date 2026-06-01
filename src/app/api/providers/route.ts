import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/providers - List verified providers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get("province");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      verified: true,
      ...(province && { province }),
    };

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          _count: {
            select: {
              equipment: { where: { isActive: true } },
              contracts: { where: { status: "ACTIVE" } },
            },
          },
        },
        orderBy: { rating: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.provider.count({ where }),
    ]);

    return NextResponse.json({
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
