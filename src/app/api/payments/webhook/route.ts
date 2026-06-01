import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

// Verify the request body against an HMAC-SHA256 signature sent in the
// `x-webhook-signature` header, keyed by PAYMENT_WEBHOOK_SECRET. This stops
// anyone from POSTing a paymentId to mark payments PAID for free.
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(signature);

  // timingSafeEqual throws on length mismatch — guard first.
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

// POST /api/payments/webhook - Webhook for payment notifications
// In production, this is called by a payment gateway and must be signed.
export async function POST(request: Request) {
  try {
    // Read the raw body so the signature is computed over the exact bytes.
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature");

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
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
