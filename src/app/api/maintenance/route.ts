import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail, emailTemplates } from '@/lib/email';

const createMaintenanceSchema = z.object({
  equipmentId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  images: z.array(z.string()).default([]),
});

// POST /api/maintenance - Create maintenance request (Customer only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = createMaintenanceSchema.parse(body);

    // If equipment is specified, verify it exists and customer has access
    if (data.equipmentId) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: data.equipmentId },
        include: {
          provider: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!equipment) {
        return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
      }

      // Verify customer has an active contract with this equipment
      const hasAccess = await prisma.contractItem.findFirst({
        where: {
          equipmentId: data.equipmentId,
          contract: {
            customerId: customer.id,
            status: 'ACTIVE',
          },
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'You do not have an active contract with this equipment' },
          { status: 403 }
        );
      }

      // Create maintenance request
      const maintenanceRequest = await prisma.maintenanceRequest.create({
        data: {
          customerId: customer.id,
          equipmentId: data.equipmentId,
          title: data.title,
          description: data.description,
          images: data.images,
        },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
          equipment: {
            include: {
              provider: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Send email notification to provider
      if (equipment.provider.user.email) {
        const emailContent = emailTemplates.maintenanceRequestCreated(
          equipment.provider.companyName,
          maintenanceRequest.id,
          customer.schoolName
        );

        await sendEmail({
          to: equipment.provider.user.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }

      return NextResponse.json(maintenanceRequest, { status: 201 });
    } else {
      // General maintenance request without specific equipment
      const maintenanceRequest = await prisma.maintenanceRequest.create({
        data: {
          customerId: customer.id,
          title: data.title,
          description: data.description,
          images: data.images,
        },
        include: {
          customer: {
            include: {
              user: true,
            },
          },
        },
      });

      return NextResponse.json(maintenanceRequest, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating maintenance request:', error);
    return NextResponse.json({ error: 'Failed to create maintenance request' }, { status: 500 });
  }
}

// GET /api/maintenance - List maintenance requests
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    // Scope results to the caller's own records. A missing profile row would make
    // the id `undefined`, which Prisma drops from the filter — leaking every
    // tenant's maintenance requests. Return an empty result in that case instead.
    const emptyResult = NextResponse.json({
      requests: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });

    if (session.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (!customer) return emptyResult;
      where.customerId = customer.id;
    } else if (session.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });
      if (!provider) return emptyResult;
      where.equipment = {
        providerId: provider.id,
      };
    }

    if (status) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          equipment: {
            include: {
              category: true,
              provider: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance requests' },
      { status: 500 }
    );
  }
}
