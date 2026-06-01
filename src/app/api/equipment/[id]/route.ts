import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/equipment/[id] - Get single equipment
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        provider: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

const updateEquipmentSchema = z.object({
  name: z.string().min(2).optional(),
  nameTh: z.string().optional(),
  description: z.string().optional(),
  descriptionTh: z.string().optional(),
  images: z.array(z.string()).optional(),
  specs: z.record(z.string(), z.string()).optional(),
  rentPriceMonthly: z.number().positive().optional(),
  leaseToOwnPrice: z.number().positive().optional(),
  leaseDuration: z.number().positive().optional(),
  depositAmount: z.number().min(0).optional(),
  stock: z.number().int().positive().optional(),
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR"]).optional(),
  insuranceMonths: z.number().int().min(0).nullable().optional(),
  conditions: z.string().nullable().optional(),
  curriculum: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// PUT /api/equipment/[id] - Update equipment (Provider only)
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    if (equipment.providerId !== provider.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = updateEquipmentSchema.parse(body);

    const updated = await prisma.equipment.update({
      where: { id },
      data,
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

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id] - Delete equipment (Provider only)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PROVIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    if (equipment.providerId !== provider.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if equipment is in active contracts
    const activeContracts = await prisma.contractItem.count({
      where: {
        equipmentId: id,
        contract: {
          status: { in: ["ACTIVE", "PENDING_APPROVAL"] },
        },
      },
    });

    if (activeContracts > 0) {
      return NextResponse.json(
        { error: "Cannot delete equipment with active contracts" },
        { status: 400 }
      );
    }

    await prisma.equipment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
