"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceCalculator } from "@/components/equipment/price-calculator";
import { formatPrice } from "@/lib/format";

export interface OfferingOption {
  id: string;
  providerName: string;
  rentPriceMonthly: number;
  leaseToOwnPrice: number | null;
  leaseDuration: number | null;
  depositAmount: number;
}

interface OfferingCalculatorProps {
  offerings: OfferingOption[];
}

// Lets the buyer pick which shop's offering drives the price calculator. The
// offerings arrive sorted cheapest-first, so the default selection is the
// cheapest. With a single offering the selector is hidden.
export function OfferingCalculator({ offerings }: OfferingCalculatorProps) {
  const [selectedId, setSelectedId] = useState(offerings[0]?.id);

  const selected =
    offerings.find((o) => o.id === selectedId) ?? offerings[0];

  if (!selected) return null;

  return (
    <div className="space-y-3">
      {offerings.length > 1 && (
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-sm font-medium">
            <Store className="h-4 w-4 text-primary" />
            เลือกร้านค้า
          </label>
          <Select value={selected.id} onValueChange={setSelectedId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="เลือกร้านค้า" />
            </SelectTrigger>
            <SelectContent>
              {offerings.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.providerName} · {formatPrice(o.rentPriceMonthly)}/เดือน
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <PriceCalculator
        rentPriceMonthly={selected.rentPriceMonthly}
        leaseToOwnPrice={selected.leaseToOwnPrice}
        leaseDuration={selected.leaseDuration}
        depositAmount={selected.depositAmount}
      />
    </div>
  );
}
