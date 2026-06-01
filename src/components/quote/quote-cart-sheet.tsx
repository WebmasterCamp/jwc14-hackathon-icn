"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import {
  calcRentalTotal,
  getCart,
  onCartChange,
  removeItem,
  unitLabels,
  updateItem,
  type DurationUnit,
  type QuoteCartItem,
} from "@/lib/quote-cart";

const durationUnits: DurationUnit[] = ["day", "month", "year"];

/**
 * Navbar cart: an icon + count badge that opens a slide-over drawer to review
 * and edit the quote cart, then head to /quote to issue the quotation.
 */
export function QuoteCartSheet() {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setItems(getCart());
    sync();
    return onCartChange(sync);
  }, []);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const rentalTotal = items.reduce((s, i) => s + calcRentalTotal(i), 0);
  const depositTotal = items.reduce((s, i) => s + i.depositAmount * i.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="ตะกร้าใบเสนอราคา" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {mounted && count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-brand-foreground">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>ใบเสนอราคาของคุณ</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-40" />
            <p>ยังไม่มีอุปกรณ์ในใบเสนอราคา</p>
            <SheetClose asChild>
              <Button asChild variant="outline">
                <Link href="/product">เลือกดูอุปกรณ์</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-2">
              {items.map((item) => (
                <div key={item.equipmentId} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.nameTh || item.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.provider.companyName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.equipmentId)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="ลบรายการ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() =>
                          updateItem(item.equipmentId, { quantity: item.quantity - 1 })
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() =>
                          updateItem(item.equipmentId, { quantity: item.quantity + 1 })
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Input
                      type="number"
                      min={1}
                      value={item.durationAmount}
                      onChange={(e) =>
                        updateItem(item.equipmentId, {
                          durationAmount: parseInt(e.target.value) || 1,
                        })
                      }
                      className="h-7 w-14"
                    />
                    <select
                      value={item.durationUnit}
                      onChange={(e) =>
                        updateItem(item.equipmentId, {
                          durationUnit: e.target.value as DurationUnit,
                        })
                      }
                      className="h-7 rounded-md border border-input bg-background px-1 text-sm"
                    >
                      {durationUnits.map((u) => (
                        <option key={u} value={u}>
                          {unitLabels[u]}
                        </option>
                      ))}
                    </select>

                    <span className="ml-auto text-sm font-semibold">
                      {formatPrice(calcRentalTotal(item))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่าเช่า</span>
                  <span>{formatPrice(rentalTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">มัดจำรวม</span>
                  <span>{formatPrice(depositTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>ยอดรวม</span>
                  <span>{formatPrice(rentalTotal + depositTotal)}</span>
                </div>
              </div>
              <SheetClose asChild>
                <Button asChild className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
                  <Link href="/quote">
                    <FileText className="mr-2 h-4 w-4" />
                    ออกใบเสนอราคา
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
