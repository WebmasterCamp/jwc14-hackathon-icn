/**
 * Membership tiers, derived purely from a customer's total PAID spend.
 * No DB column — call getTierStatus() with the summed PAID payment amount.
 *
 * Thresholds (THB, inclusive lower bound):
 *   Bronze  ฿0        – 49,999
 *   Silver  ฿50,000   – 199,999
 *   Gold    ฿200,000+
 */

export type TierKey = "BRONZE" | "SILVER" | "GOLD";

export interface TierDef {
  key: TierKey;
  label: string;
  emoji: string;
  /** Inclusive lower bound of total paid spend that unlocks this tier. */
  min: number;
  /** Tailwind classes for the tier badge (bg + text). */
  badgeClass: string;
  /** Tailwind class for the progress-bar fill. */
  barClass: string;
  /** Short Thai perk lines shown on the membership card. */
  perks: string[];
}

export const TIERS: TierDef[] = [
  {
    key: "BRONZE",
    label: "Bronze",
    emoji: "🥉",
    min: 0,
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    barClass: "bg-amber-500",
    perks: ["การสนับสนุนมาตรฐาน", "รับใบเสนอราคาออนไลน์"],
  },
  {
    key: "SILVER",
    label: "Silver",
    emoji: "🥈",
    min: 50_000,
    badgeClass:
      "bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200",
    barClass: "bg-slate-400",
    perks: ["ส่วนลด 5% ทุกสัญญา", "การสนับสนุนแบบเร่งด่วน"],
  },
  {
    key: "GOLD",
    label: "Gold",
    emoji: "🥇",
    min: 200_000,
    badgeClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    barClass: "bg-yellow-500",
    perks: [
      "ส่วนลด 10% ทุกสัญญา",
      "ผู้จัดการบัญชีเฉพาะ",
      "การสนับสนุน 24/7",
    ],
  },
];

export interface TierStatus {
  current: TierDef;
  /** The next tier up, or null when already at the top tier. */
  next: TierDef | null;
  totalPaid: number;
  /** Amount still needed to reach the next tier (0 when maxed out). */
  amountToNext: number;
  /** Progress within the current bracket toward the next tier, 0–100. */
  progressPercent: number;
}

/**
 * Resolve the membership tier and progress for a given total paid amount.
 */
export function getTierStatus(totalPaid: number): TierStatus {
  const spend = Math.max(0, totalPaid);

  // Highest tier whose threshold is met (TIERS is ascending by `min`).
  let index = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (spend >= TIERS[i].min) index = i;
  }

  const current = TIERS[index];
  const next = index < TIERS.length - 1 ? TIERS[index + 1] : null;

  if (!next) {
    return {
      current,
      next: null,
      totalPaid: spend,
      amountToNext: 0,
      progressPercent: 100,
    };
  }

  const span = next.min - current.min;
  const progressed = spend - current.min;
  const progressPercent = Math.min(
    100,
    Math.round((progressed / span) * 100)
  );

  return {
    current,
    next,
    totalPaid: spend,
    amountToNext: Math.max(0, next.min - spend),
    progressPercent,
  };
}
