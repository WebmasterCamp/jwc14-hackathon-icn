import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'noreply@jwc-icn.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send exception:', error);
    return { success: false, error };
  }
}

export const emailTemplates = {
  providerVerified: (providerName: string) => ({
    subject: 'Your Provider Account Has Been Verified',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Account Verified Successfully</h2>
        <p>Dear ${providerName},</p>
        <p>Congratulations! Your provider account has been verified and approved.</p>
        <p>You can now:</p>
        <ul>
          <li>List your equipment for rent</li>
          <li>Manage contracts with customers</li>
          <li>Receive payments through the platform</li>
        </ul>
        <p>Get started by logging into your dashboard and adding your first equipment.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/provider"
           style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          Go to Dashboard
        </a>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `,
  }),

  providerSuspended: (providerName: string, reason?: string) => ({
    subject: 'Your Provider Account Has Been Suspended',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Account Suspended</h2>
        <p>Dear ${providerName},</p>
        <p>Your provider account has been suspended.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>During this suspension period:</p>
        <ul>
          <li>Your equipment listings are hidden from customers</li>
          <li>You cannot create new contracts</li>
          <li>Existing contracts will continue as normal</li>
        </ul>
        <p>If you believe this is a mistake or would like to appeal, please contact our support team.</p>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          Support Email: support@jwc-icn.com
        </p>
      </div>
    `,
  }),

  contractCreated: (customerName: string, contractId: string, providerName: string) => ({
    subject: 'New Contract Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contract Created</h2>
        <p>Dear ${customerName},</p>
        <p>A new contract has been created by ${providerName}.</p>
        <p><strong>Contract ID:</strong> ${contractId}</p>
        <p>Please review the contract details and confirm your acceptance.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/contracts/${contractId}"
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Contract
        </a>
      </div>
    `,
  }),

  maintenanceRequestCreated: (providerName: string, requestId: string, customerName: string) => ({
    subject: 'New Maintenance Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">New Maintenance Request</h2>
        <p>Dear ${providerName},</p>
        <p>${customerName} has submitted a new maintenance request for your equipment.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p>Please review the request and respond as soon as possible.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/provider/maintenance/${requestId}"
           style="display: inline-block; background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Request
        </a>
      </div>
    `,
  }),

  paymentReceived: (customerName: string, amount: number, contractId: string) => ({
    subject: 'Payment Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Payment Received</h2>
        <p>Dear ${customerName},</p>
        <p>We have received your payment of <strong>฿${amount.toLocaleString()}</strong>.</p>
        <p><strong>Contract ID:</strong> ${contractId}</p>
        <p>Thank you for your payment. You can view your receipt in your dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/payments"
           style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Payments
        </a>
      </div>
    `,
  }),
};
