import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processDemoPayment } from "@/lib/payment";

// POST /api/payments/process - Process a demo payment
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, paymentMethod } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        contract: {
          include: {
            customer: true,
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

    // Verify the user owns this payment
    if (payment.contract.customer.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if already paid
    if (payment.status === "PAID") {
      return NextResponse.json(
        { error: "Payment already processed" },
        { status: 400 }
      );
    }

    // Process demo payment
    const result = await processDemoPayment(paymentId);

    if (result.success) {
      // Update payment record
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          transactionId: result.transactionId,
          receiptUrl: result.receiptUrl,
          paymentMethod: paymentMethod || "demo",
        },
      });

      // Check if all payments are completed to activate contract
      const allPayments = payment.contract.payments;
      const allPaid = allPayments.every(
        (p) => p.status === "PAID" || p.id === paymentId
      );

      if (allPaid && payment.contract.status === "PENDING_APPROVAL") {
        await prisma.contract.update({
          where: { id: payment.contract.id },
          data: { status: "ACTIVE" },
        });
      }

      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        receiptUrl: result.receiptUrl,
        message: "ชำระเงินสำเร็จ",
      });
    } else {
      // Mark payment as failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: "Payment processing failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
