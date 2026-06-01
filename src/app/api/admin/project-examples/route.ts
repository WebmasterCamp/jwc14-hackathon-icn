import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectExampleSchema } from "@/lib/validations/project-example";

/**
 * GET /api/admin/project-examples
 * List all landing-page project showcase cards (Admin only).
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.projectExample.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching project examples:", error);
    return NextResponse.json(
      { error: "Failed to fetch project examples" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/project-examples
 * Create a new project showcase card (Admin only). New cards append to the end
 * of the list by default (sortOrder = current max + 1).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = projectExampleSchema.parse(body);

    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const last = await prisma.projectExample.findFirst({
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (last?.sortOrder ?? -1) + 1;
    }

    const project = await prisma.projectExample.create({
      data: { ...data, sortOrder },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project example:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create project example" },
      { status: 500 }
    );
  }
}
