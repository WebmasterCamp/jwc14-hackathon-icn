import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/providers/[id]/verify - Verify a provider (Admin only)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    if (provider.verified) {
      return NextResponse.json(
        { error: "Provider already verified" },
        { status: 400 }
      );
    }

    const updated = await prisma.provider.update({
      where: { id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    // Send verification email to provider
    if (provider.user.email) {
      const emailContent = emailTemplates.providerVerified(provider.companyName);
      await sendEmail({
        to: provider.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    return NextResponse.json({
      success: true,
      provider: updated,
    });
  } catch (error) {
    console.error("Error verifying provider:", error);
    return NextResponse.json(
      { error: "Failed to verify provider" },
      { status: 500 }
    );
  }
}

// DELETE /api/providers/[id]/verify - Unverify/suspend a provider (Admin only)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.provider.update({
      where: { id },
      data: {
        verified: false,
        verifiedAt: null,
      },
    });

    // Send suspension email to provider
    if (provider.user.email) {
      const emailContent = emailTemplates.providerSuspended(provider.companyName);
      await sendEmail({
        to: provider.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    return NextResponse.json({
      success: true,
      provider: updated,
    });
  } catch (error) {
    console.error("Error suspending provider:", error);
    return NextResponse.json(
      { error: "Failed to suspend provider" },
      { status: 500 }
    );
  }
}
