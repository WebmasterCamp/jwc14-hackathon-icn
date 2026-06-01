import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Either field may be sent independently: role changes and provider-flag
// toggles come from separate menu actions. At least one must be present.
const updateUserSchema = z
  .object({
    role: z.enum(["ADMIN", "USER"]).optional(),
    isProvider: z.boolean().optional(),
  })
  .refine((d) => d.role !== undefined || d.isProvider !== undefined, {
    message: "ไม่มีข้อมูลที่จะอัปเดต",
  });

// PATCH /api/admin/users/[id] - Change a user's role (Admin only).
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้" },
        { status: 400 }
      );
    }

    const parsed = updateUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { provider: { select: { id: true } } },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { role, isProvider } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      // Turning provider on for a user with no Provider profile would break the
      // /provider console (it requires a Provider row), so create a minimal
      // placeholder profile the user can complete later in their settings.
      if (isProvider === true && !user.provider) {
        await tx.provider.create({
          data: {
            userId: id,
            companyName: user.name ?? user.email,
          },
        });
      }

      return tx.user.update({
        where: { id },
        data: {
          ...(role !== undefined ? { role } : {}),
          ...(isProvider !== undefined ? { isProvider } : {}),
        },
      });
    });

    return NextResponse.json({
      success: true,
      user: { id: updated.id, role: updated.role, isProvider: updated.isProvider },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
