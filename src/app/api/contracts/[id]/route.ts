import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/contracts/[id] - Get single contract
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        provider: {
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
        items: {
          include: {
            equipment: {
              include: {
                category: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Check access permissions
    if (session.user.role === 'ADMIN') {
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });
      if (contract.providerId !== provider?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role === 'USER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (contract.customerId !== customer?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  }
}

const updateContractSchema = z.object({
  status: z
    .enum([
      'DRAFT',
      'PENDING_APPROVAL',
      'ACTIVE',
      'SUSPENDED',
      'COMPLETED',
      'TERMINATED',
      'CANCELLED',
      'OVERDUE',
    ])
    .optional(),
  startDate: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  endDate: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        equipmentId: z.string(),
        quantity: z.number().int().positive(),
        pricePerMonth: z.number().positive(),
      })
    )
    .optional(),
});

// PATCH /api/contracts/[id] - Update contract
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Check permissions
    let canUpdate = false;
    if (session.user.role === 'ADMIN') {
      canUpdate = true;
    } else if (session.user.role === 'ADMIN') {
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });
      canUpdate = contract.providerId === provider?.id;
    } else if (session.user.role === 'USER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      canUpdate = contract.customerId === customer?.id;
    }

    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateContractSchema.parse(body);

    // Prepare update data
    const updateData: any = {};

    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'ACTIVE' && !contract.signedAt) {
        updateData.signedAt = new Date();
      }
    }

    if (data.startDate) updateData.startDate = data.startDate;
    if (data.endDate) updateData.endDate = data.endDate;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // If items are updated, recalculate amounts
    if (data.items) {
      const monthlyAmount = data.items.reduce(
        (sum, item) => sum + item.pricePerMonth * item.quantity,
        0
      );
      const startDate = data.startDate || contract.startDate;
      const endDate = data.endDate || contract.endDate;
      const months = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const totalAmount = monthlyAmount * months;

      // Calculate new deposit
      const equipmentIds = data.items.map((item) => item.equipmentId);
      const equipment = await prisma.equipment.findMany({
        where: { id: { in: equipmentIds } },
      });
      const depositAmount = data.items.reduce((sum, item) => {
        const eq = equipment.find((e) => e.id === item.equipmentId);
        return sum + (eq?.depositAmount || 0) * item.quantity;
      }, 0);

      updateData.monthlyAmount = monthlyAmount;
      updateData.totalAmount = totalAmount;
      updateData.depositAmount = depositAmount;

      // Delete old items and create new ones
      await prisma.contractItem.deleteMany({
        where: { contractId: id },
      });

      updateData.items = {
        create: data.items.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
          pricePerMonth: item.pricePerMonth,
          subtotal: item.pricePerMonth * item.quantity,
        })),
      };
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        provider: true,
        customer: true,
        items: {
          include: {
            equipment: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating contract:', error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

// DELETE /api/contracts/[id] - Cancel contract
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Check permissions
    let canDelete = false;
    if (session.user.role === 'ADMIN') {
      canDelete = true;
    } else if (session.user.role === 'ADMIN') {
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });
      canDelete = contract.providerId === provider?.id;
    }

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only cancel draft or pending contracts
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(contract.status)) {
      return NextResponse.json(
        { error: 'Can only cancel draft or pending contracts' },
        { status: 400 }
      );
    }

    await prisma.contract.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling contract:', error);
    return NextResponse.json({ error: 'Failed to cancel contract' }, { status: 500 });
  }
}
