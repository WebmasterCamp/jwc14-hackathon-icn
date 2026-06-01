import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymentGateway } from '@/lib/payment-gateway';
import { sendEmail, emailTemplates } from '@/lib/email';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const processPaymentSchema = z.object({
  paymentMethod: z.string(),
  cardDetails: z
    .object({
      number: z.string(),
      expMonth: z.number().int().min(1).max(12),
      expYear: z.number().int(),
      cvc: z.string(),
      holderName: z.string(),
    })
    .optional(),
});

// POST /api/payments/[id]/process - Process payment
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            customer: {
              include: {
                user: true,
              },
            },
            provider: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify customer owns this payment
    if (session.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });

      if (payment.contract.customerId !== customer?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already paid
    if (payment.status === 'PAID') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    const body = await request.json();
    const data = processPaymentSchema.parse(body);

    // Create payment intent
    const paymentIntent = await paymentGateway.createPaymentIntent(payment.amount, 'THB');

    // Process payment
    let paymentResult;
    if (data.cardDetails) {
      paymentResult = await paymentGateway.processPayment(paymentIntent.id, data.cardDetails);
    } else {
      // Mock success for other payment methods
      paymentResult = { success: true, paymentIntentId: paymentIntent.id };
    }

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Payment failed' },
        { status: 400 }
      );
    }

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        transactionId: paymentResult.paymentIntentId,
        paymentMethod: data.paymentMethod,
      },
      include: {
        contract: {
          include: {
            customer: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Update provider revenue
    await prisma.provider.update({
      where: { id: payment.contract.providerId },
      data: {
        totalRevenue: {
          increment: payment.amount,
        },
      },
    });

    // Send confirmation email to customer
    if (payment.contract.customer.user.email) {
      const emailContent = emailTemplates.paymentReceived(
        payment.contract.customer.schoolName,
        payment.amount,
        payment.contract.contractNumber
      );

      await sendEmail({
        to: payment.contract.customer.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      transactionId: paymentResult.paymentIntentId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
