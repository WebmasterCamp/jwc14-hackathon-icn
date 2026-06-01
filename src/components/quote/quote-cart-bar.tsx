"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { getCart, onCartChange } from "@/lib/quote-cart";

/**
 * Floating bar that appears across public pages whenever the quote cart has
 * items. Links to the /quote review page. Hidden when the cart is empty.
 */
export function QuoteCartBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () =>
      setCount(getCart().reduce((n, i) => n + i.quantity, 0));
    sync();
    return onCartChange(sync);
  }, []);

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <Link
        href="/quote"
        className="flex items-center gap-3 rounded-full bg-brand px-6 py-3 text-brand-foreground shadow-lg transition-transform hover:scale-[1.02]"
      >
        <span className="relative flex h-6 w-6 items-center justify-center">
          <FileText className="h-5 w-5" />
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-foreground px-1 text-[11px] font-bold text-brand">
            {count}
          </span>
        </span>
        <span className="font-semibold">ออกใบเสนอราคา</span>
      </Link>
    </div>
  );
}
