import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/payments/webhook - Demo webhook for payment notifications
// In production, this would be called by a payment gateway
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentId, status, transactionId } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment based on status
    if (status === "completed") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          transactionId: transactionId || `DEMO-${Date.now()}`,
        },
      });

      // Check if all payments are completed to activate contract
      const allPaid = payment.contract.payments.every(
        (p) => p.status === "PAID" || p.id === paymentId
      );

      if (allPaid && payment.contract.status === "PENDING_APPROVAL") {
        await prisma.contract.update({
          where: { id: payment.contract.id },
          data: { status: "ACTIVE" },
        });
      }
    } else if (status === "failed") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
