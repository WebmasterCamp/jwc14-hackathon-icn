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

/** Convert a duration expressed in days/months/years to months (matches calcRentalTotal). */
export function durationToMonths(amount: number, unit: DurationUnit): number {
  if (unit === "day") return amount / 30;
  if (unit === "year") return amount * 12;
  return amount;
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
