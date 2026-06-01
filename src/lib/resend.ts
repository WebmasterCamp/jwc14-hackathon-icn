import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return _resend;
}

const FROM_EMAIL = "Sparkgo <noreply@sparkgo.co.th>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendWelcomeEmail({
  email,
  name,
  role,
}: {
  email: string;
  name: string;
  role: "PROVIDER" | "CUSTOMER";
}) {
  const subject =
    role === "ADMIN"
      ? "ยินดีต้อนรับสู่ Sparkgo - สำหรับผู้ให้บริการ"
      : "ยินดีต้อนรับสู่ Sparkgo - สำหรับสถานศึกษา";

  const dashboardUrl =
    role === "ADMIN"
      ? `${APP_URL}/dashboard/provider`
      : `${APP_URL}/account`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject,
    html: `
      <div style="font-family: 'IBM Plex Sans Thai', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">ยินดีต้อนรับสู่ Sparkgo</h1>
        <p>สวัสดีคุณ ${name},</p>
        <p>ขอบคุณที่สมัครใช้งาน Sparkgo - แพลตฟอร์มเช่าอุปกรณ์ IoT และ STEM สำหรับโรงเรียนไทย</p>
        ${
          role === "ADMIN"
            ? `
          <p>ในฐานะผู้ให้บริการ คุณสามารถ:</p>
          <ul>
            <li>เพิ่มอุปกรณ์ให้เช่า</li>
            <li>จัดการสัญญากับโรงเรียน</li>
            <li>ติดตามการชำระเงิน</li>
          </ul>
          <p><strong>หมายเหตุ:</strong> บัญชีของคุณจะถูกตรวจสอบและยืนยันภายใน 1-2 วันทำการ</p>
        `
            : `
          <p>ในฐานะสถานศึกษา คุณสามารถ:</p>
          <ul>
            <li>ค้นหาอุปกรณ์ STEM และ IoT</li>
            <li>ขอใบเสนอราคาจากผู้ให้บริการ</li>
            <li>จัดการสัญญาและการชำระเงิน</li>
          </ul>
        `
        }
        <a href="${dashboardUrl}" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          เข้าสู่แดชบอร์ด
        </a>
        <p style="margin-top: 24px; color: #666;">หากมีคำถามใดๆ สามารถติดต่อเราได้ที่ support@sparkgo.co.th</p>
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Sparkgo - แพลตฟอร์มเช่าอุปกรณ์การศึกษา</p>
      </div>
    `,
  });
}

export async function sendPaymentReminderEmail({
  email,
  name,
  amount,
  dueDate,
  contractNumber,
}: {
  email: string;
  name: string;
  amount: number;
  dueDate: Date;
  contractNumber: string;
}) {
  const formattedAmount = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dueDate);

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `แจ้งเตือน: กำหนดชำระค่าเช่า - ${contractNumber}`,
    html: `
      <div style="font-family: 'IBM Plex Sans Thai', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">แจ้งเตือนการชำระเงิน</h1>
        <p>สวัสดีคุณ ${name},</p>
        <p>ขอแจ้งเตือนการชำระค่าเช่าอุปกรณ์:</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>เลขที่สัญญา:</strong> ${contractNumber}</p>
          <p><strong>จำนวนเงิน:</strong> ${formattedAmount}</p>
          <p><strong>กำหนดชำระ:</strong> ${formattedDate}</p>
        </div>
        <a href="${APP_URL}/account/payments" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          ชำระเงิน
        </a>
        <p style="margin-top: 24px; color: #666;">หากชำระแล้ว กรุณาอย่าสนใจอีเมลนี้</p>
      </div>
    `,
  });
}

export async function sendPaymentOverdueEmail({
  email,
  name,
  amount,
  dueDate,
  contractNumber,
}: {
  email: string;
  name: string;
  amount: number;
  dueDate: Date;
  contractNumber: string;
}) {
  const formattedAmount = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dueDate);

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `สำคัญ: ค่าเช่าเลยกำหนดชำระ - ${contractNumber}`,
    html: `
      <div style="font-family: 'IBM Plex Sans Thai', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #DC2626;">ค่าเช่าเลยกำหนดชำระ</h1>
        <p>สวัสดีคุณ ${name},</p>
        <p>ขอแจ้งว่าค่าเช่าอุปกรณ์ของคุณได้เลยกำหนดชำระแล้ว:</p>
        <div style="background-color: #FEE2E2; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #DC2626;">
          <p><strong>เลขที่สัญญา:</strong> ${contractNumber}</p>
          <p><strong>จำนวนเงิน:</strong> ${formattedAmount}</p>
          <p><strong>กำหนดชำระเดิม:</strong> ${formattedDate}</p>
        </div>
        <p><strong>กรุณาชำระเงินโดยเร็วที่สุดเพื่อหลีกเลี่ยงการระงับบริการ</strong></p>
        <a href="${APP_URL}/account/payments" style="display: inline-block; background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
          ชำระเงินทันที
        </a>
        <p style="margin-top: 24px; color: #666;">หากต้องการความช่วยเหลือ กรุณาติดต่อ support@sparkgo.co.th</p>
      </div>
    `,
  });
}

export async function sendContractApprovedEmail({
  email,
  name,
  contractNumber,
  providerName,
}: {
  email: string;
  name: string;
  contractNumber: string;
  providerName: string;
}) {
  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `สัญญาได้รับการอนุมัติแล้ว - ${contractNumber}`,
    html: `
      <div style="font-family: 'IBM Plex Sans Thai', sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">สัญญาได้รับการอนุมัติแล้ว</h1>
        <p>สวัสดีคุณ ${name},</p>
        <p>สัญญาเช่าอุปกรณ์ของคุณได้รับการอนุมัติแล้ว:</p>
        <div style="background-color: #D1FAE5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>เลขที่สัญญา:</strong> ${contractNumber}</p>
          <p><strong>ผู้ให้บริการ:</strong> ${providerName}</p>
        </div>
        <p>ขั้นตอนถัดไป:</p>
        <ol>
          <li>ชำระค่ามัดจำ</li>
          <li>รอการจัดส่งอุปกรณ์</li>
          <li>ตรวจรับอุปกรณ์</li>
        </ol>
        <a href="${APP_URL}/account/contracts" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          ดูรายละเอียดสัญญา
        </a>
      </div>
    `,
  });
}
