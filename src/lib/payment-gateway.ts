// Mock payment gateway for now
// Replace with real payment gateway integration (Stripe, Omise, etc.) later

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export interface CardDetails {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  holderName: string;
}

export class PaymentGateway {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PAYMENT_GATEWAY_API_KEY || 'mock_key';
  }

  async createPaymentIntent(amount: number, currency: string = 'THB'): Promise<PaymentIntent> {
    // Mock implementation
    // In production, this would call the actual payment gateway API

    await this.delay(500); // Simulate API call

    const paymentIntent: PaymentIntent = {
      id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'pending',
      clientSecret: `secret_${Math.random().toString(36).substr(2, 16)}`,
    };

    return paymentIntent;
  }

  async processPayment(
    paymentIntentId: string,
    cardDetails: CardDetails
  ): Promise<PaymentResult> {
    // Mock implementation
    // In production, this would process the payment through the gateway

    await this.delay(1000); // Simulate payment processing

    // Validate card number (basic Luhn algorithm check)
    if (!this.validateCardNumber(cardDetails.number)) {
      return {
        success: false,
        error: 'Invalid card number',
      };
    }

    // Check expiry date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (
      cardDetails.expYear < currentYear ||
      (cardDetails.expYear === currentYear && cardDetails.expMonth < currentMonth)
    ) {
      return {
        success: false,
        error: 'Card has expired',
      };
    }

    // Mock: 95% success rate
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      return {
        success: true,
        paymentIntentId,
      };
    } else {
      return {
        success: false,
        error: 'Payment declined by bank',
      };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    // Mock implementation
    await this.delay(500);

    return {
      id: paymentIntentId,
      amount: 0, // Would be fetched from the gateway
      currency: 'THB',
      status: 'succeeded',
    };
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentResult> {
    // Mock implementation
    await this.delay(1000);

    return {
      success: true,
      paymentIntentId,
    };
  }

  private validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    // Check if it's all digits
    if (!/^\d+$/.test(cleaned)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const paymentGateway = new PaymentGateway();

// Test card numbers for development
export const TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
};
