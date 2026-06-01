import { Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getTierStatus } from "@/lib/tier";

/**
 * Membership status card for the customer account dashboard. Tier and progress
 * are derived from the customer's total PAID spend — see {@link getTierStatus}.
 */
export function MembershipCard({ totalPaid }: { totalPaid: number }) {
  const { current, next, amountToNext, progressPercent } =
    getTierStatus(totalPaid);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>สถานะสมาชิก</CardTitle>
          <CardDescription>ยอดใช้จ่ายสะสม {formatPrice(totalPaid)}</CardDescription>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
            current.badgeClass
          )}
        >
          <span className="text-base leading-none">{current.emoji}</span>
          {current.label}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress toward the next tier */}
        <div className="space-y-1.5">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn("h-full rounded-full transition-all", current.barClass)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {next
              ? `อีก ${formatPrice(amountToNext)} จะเลื่อนเป็นระดับ ${next.label} ${next.emoji}`
              : "คุณอยู่ในระดับสูงสุดแล้ว 🎉"}
          </p>
        </div>

        {/* Perks for the current tier */}
        <ul className="space-y-1.5">
          {current.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
