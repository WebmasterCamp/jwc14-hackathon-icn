// Demo Payment System
// This is a mock payment system for demonstration purposes

export interface DemoPaymentSession {
  id: string;
  paymentId: string;
  customerId: string;
  amount: number;
  description: string;
  status: "pending" | "completed" | "failed";
  paymentUrl: string;
  createdAt: Date;
}

// Generate a random transaction ID
function generateTransactionId(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// Simulate creating a checkout session
export async function createDemoCheckoutSession({
  customerId,
  paymentId,
  amount,
  description,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  paymentId: string;
  amount: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<DemoPaymentSession> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const sessionId = generateTransactionId();

  // In a real demo, you might redirect to a demo payment page
  // For now, we'll just return a session that auto-completes
  return {
    id: sessionId,
    paymentId,
    customerId,
    amount,
    description,
    status: "pending",
    // Demo payment page URL - in production this would be a real payment gateway
    paymentUrl: `${successUrl}?session_id=${sessionId}&demo=true`,
    createdAt: new Date(),
  };
}

// Simulate processing a demo payment
export async function processDemoPayment(sessionId: string): Promise<{
  success: boolean;
  transactionId: string;
  receiptUrl: string;
}> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Demo always succeeds
  return {
    success: true,
    transactionId: generateTransactionId(),
    receiptUrl: `/demo-receipt/${sessionId}`,
  };
}

// Format currency for display
export function formatThaiCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
}

// Demo payment methods available
export const DEMO_PAYMENT_METHODS = [
  { id: "bank_transfer", name: "โอนเงินผ่านธนาคาร", icon: "Building2" },
  { id: "promptpay", name: "พร้อมเพย์", icon: "Smartphone" },
  { id: "credit_card", name: "บัตรเครดิต/เดบิต", icon: "CreditCard" },
] as const;

export type DemoPaymentMethod = (typeof DEMO_PAYMENT_METHODS)[number]["id"];
