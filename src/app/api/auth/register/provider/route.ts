import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { providerRegistrationSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod schema (fixes unsafe type casting)
    const validatedData = providerRegistrationSchema.parse(body);

    const {
      email,
      password,
      name,
      phone,
      companyName,
      taxId,
      address,
      province,
      description,
    } = validatedData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and provider profile in a transaction. The user keeps the
    // normal USER role; the `isProvider` flag is what grants access to the
    // /provider console.
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          role: "USER",
          isProvider: true,
        },
      });

      const provider = await tx.provider.create({
        data: {
          userId: user.id,
          companyName,
          taxId,
          address,
          province,
          description,
        },
      });

      return { user, provider };
    });

    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ", userId: result.user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Provider registration error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    );
  }
}
