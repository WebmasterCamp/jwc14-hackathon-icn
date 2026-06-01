import { format as dateFnsFormat, addYears } from "date-fns";
import { th } from "date-fns/locale";

export function formatPrice(amount: number): string {
  // Guard against NaN/undefined/Infinity so prices never render as "฿NaN".
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("th-TH").format(value);
}

export function formatThaiDate(
  date: Date | string,
  formatStr: string = "d MMMM yyyy",
  era: "BE" | "CE" = "BE"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (era === "BE") {
    // Convert to Buddhist Era (พ.ศ.)
    const beDate = addYears(d, 543);
    return dateFnsFormat(beDate, formatStr, { locale: th });
  }

  return dateFnsFormat(d, formatStr, { locale: th });
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, "d MMM yy", { locale: th });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "วันนี้";
  if (diffDays === 1) return "เมื่อวาน";
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} สัปดาห์ที่แล้ว`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือนที่แล้ว`;
  return `${Math.floor(diffDays / 365)} ปีที่แล้ว`;
}

export function formatPhoneNumber(phone: string): string {
  // Format Thai phone number: 08X-XXX-XXXX
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatContractDuration(months: number): string {
  if (months < 12) {
    return `${months} เดือน`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ปี`;
  }
  return `${years} ปี ${remainingMonths} เดือน`;
}
