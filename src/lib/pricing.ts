// Per-product duration discount tiers. A longer rental matches a higher tier and
// lowers the effective monthly price. This is the single source of truth shared
// by the product calculator, quotation totals, and contract amounts so they all
// discount identically.

import type { DurationUnit } from "@/lib/quote-cart";

export interface PriceTier {
  minMonths: number;
  maxMonths: number | null; // null = open-ended (e.g. "24+")
  discountPercent: number; // 0–100
}

/** Convert a duration expressed in days/weeks/months/years to months (matches calcRentalTotal). */
export function durationToMonths(amount: number, unit: DurationUnit): number {
  if (unit === "day") return amount / 30;
  if (unit === "week") return amount / 4.345;
  if (unit === "year") return amount * 12;
  return amount;
}

// ============================================
// Per-period rental prices (day / week / month / year)
// ============================================

// The set of explicit per-period prices an Equipment offering may carry.
// rentPriceMonthly is always present; the others are optional.
export interface PeriodPrices {
  rentPriceDaily?: number | null;
  rentPriceWeekly?: number | null;
  rentPriceMonthly: number;
  rentPriceYearly?: number | null;
}

// Period price fields in ascending duration order (shortest period first).
export const PERIOD_FIELDS: { unit: DurationUnit; field: keyof PeriodPrices }[] = [
  { unit: "day", field: "rentPriceDaily" },
  { unit: "week", field: "rentPriceWeekly" },
  { unit: "month", field: "rentPriceMonthly" },
  { unit: "year", field: "rentPriceYearly" },
];

/** Every period price actually set on an offering, shortest period first. */
export function listPeriodPrices(
  p: PeriodPrices
): { unit: DurationUnit; amount: number }[] {
  return PERIOD_FIELDS.map(({ unit, field }) => ({
    unit,
    amount: Number(p[field] ?? 0),
  })).filter((x) => x.amount > 0);
}

/**
 * The "starting from" price to advertise on a card across one or more offerings:
 * the shortest period any offering prices, and the cheapest amount at that
 * period. Returns null only if no offering has any price (shouldn't happen,
 * since rentPriceMonthly is required).
 */
export function entryPrice(
  offerings: PeriodPrices[]
): { amount: number; unit: DurationUnit } | null {
  for (const { unit, field } of PERIOD_FIELDS) {
    const amounts = offerings
      .map((o) => Number(o[field] ?? 0))
      .filter((a) => a > 0);
    if (amounts.length) return { amount: Math.min(...amounts), unit };
  }
  return null;
}

/**
 * Discount percent (0–100) for a rental of `months`. Picks the most-specific
 * matching tier (highest minMonths), so overlapping tiers degrade gracefully.
 * Returns 0 when no tier matches.
 */
export function findDurationDiscount(months: number, tiers: PriceTier[]): number {
  if (!Number.isFinite(months) || !tiers?.length) return 0;
  const match = tiers
    .filter(
      (t) =>
        months >= t.minMonths &&
        (t.maxMonths == null || months <= t.maxMonths)
    )
    .sort((a, b) => b.minMonths - a.minMonths)[0];
  return match ? match.discountPercent : 0;
}

/** Apply the duration discount for `months` to `amount`. */
export function applyDurationDiscount(
  amount: number,
  months: number,
  tiers: PriceTier[]
): number {
  const pct = findDurationDiscount(months, tiers);
  return amount * (1 - pct / 100);
}
