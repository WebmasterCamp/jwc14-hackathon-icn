"use client";

import { useState, useMemo } from "react";
import { Calculator, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { findDurationDiscount, type PriceTier } from "@/lib/pricing";

interface PriceCalculatorProps {
  rentPriceMonthly: number;
  leaseToOwnPrice?: number | null;
  leaseDuration?: number | null;
  depositAmount: number;
  // Per-product duration discount tiers; longer rentals lower the monthly price.
  priceTiers?: PriceTier[];
}

// The base-ui Slider callback doesn't guarantee an array for a single thumb, so
// read the value defensively (handles both `number` and `number[]`).
function asScalar(value: number | readonly number[]): number {
  return Array.isArray(value) ? Number(value[0]) : Number(value);
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export function PriceCalculator({
  rentPriceMonthly,
  leaseToOwnPrice,
  leaseDuration = 24,
  depositAmount,
  priceTiers = [],
}: PriceCalculatorProps) {
  const [rentMonths, setRentMonths] = useState(12);
  const [quantity, setQuantity] = useState(1);

  const calculations = useMemo(() => {
    // Coerce every numeric input to a finite value so a stray undefined/NaN can
    // never propagate into the totals (which previously rendered "฿NaN").
    const months = Number.isFinite(rentMonths) ? rentMonths : 1;
    const qty = Number.isFinite(quantity) ? quantity : 1;
    const monthly = Number(rentPriceMonthly) || 0;
    const deposit = Number(depositAmount) || 0;
    const leasePrice = Number(leaseToOwnPrice) || 0;
    const leaseMonths = Number(leaseDuration) || 0;

    // Duration discount: longer rentals lower the effective monthly price.
    const discountPercent = findDurationDiscount(months, priceTiers);
    const discountedMonthly = monthly * (1 - discountPercent / 100);

    const rentPerMonth = discountedMonthly * qty;
    const rentTotal = rentPerMonth * months;
    const rentDeposit = deposit * qty;
    const rentGrandTotal = rentTotal + rentDeposit;

    const leaseMonthly = leasePrice && leaseMonths ? leasePrice / leaseMonths : 0;
    const leaseTotal = leasePrice * qty;
    const leaseDeposit = deposit * qty;
    const leaseGrandTotal = leaseTotal + leaseDeposit;

    const savings = leaseTotal > 0 ? rentGrandTotal - leaseGrandTotal : 0;
    const savingsPercent =
      leaseTotal > 0 && leaseGrandTotal > 0
        ? (savings / leaseGrandTotal) * 100
        : 0;

    return {
      discountPercent,
      fullRentPerMonth: monthly * qty,
      rentPerMonth,
      rentTotal,
      rentDeposit,
      rentGrandTotal,
      leaseMonthly,
      leaseTotal,
      leaseDeposit,
      leaseGrandTotal,
      savings,
      savingsPercent,
    };
  }, [rentPriceMonthly, rentMonths, quantity, depositAmount, leaseToOwnPrice, leaseDuration, priceTiers]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>คำนวณค่าใช้จ่าย</CardTitle>
        </div>
        <CardDescription>
          เปรียบเทียบระหว่างการเช่ารายเดือนและเช่าซื้อ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quantity Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">จำนวน</label>
            <span className="text-sm text-muted-foreground">{quantity} ชิ้น</span>
          </div>
          <Slider
            value={[quantity]}
            onValueChange={(value) => setQuantity(clamp(asScalar(value), 1, 10))}
            min={1}
            max={10}
            step={1}
          />
        </div>

        {/* Duration Slider (for rent) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">ระยะเวลาเช่า</label>
            <span className="text-sm text-muted-foreground">{rentMonths} เดือน</span>
          </div>
          <Slider
            value={[rentMonths]}
            onValueChange={(value) => setRentMonths(clamp(asScalar(value), 1, 36))}
            min={1}
            max={36}
            step={1}
          />
        </div>

        <Tabs defaultValue="rent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rent">เช่ารายเดือน</TabsTrigger>
            <TabsTrigger value="lease" disabled={!leaseToOwnPrice}>
              เช่าซื้อ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rent" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ค่าเช่ารายเดือน</span>
                <span className="flex items-center gap-1.5">
                  {calculations.discountPercent > 0 && (
                    <span className="text-muted-foreground line-through">
                      {formatPrice(calculations.fullRentPerMonth)}
                    </span>
                  )}
                  {formatPrice(calculations.rentPerMonth)}
                </span>
              </div>
              {calculations.discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>ส่วนลดระยะยาว</span>
                  <span>−{calculations.discountPercent}%</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ระยะเวลา</span>
                <span>{rentMonths} เดือน</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">รวมค่าเช่า</span>
                <span>{formatPrice(calculations.rentTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  ค่ามัดจำ
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ได้รับคืนเมื่อสิ้นสุดสัญญา</p>
                    </TooltipContent>
                  </Tooltip>
                </span>
                <span>{formatPrice(calculations.rentDeposit)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-semibold">
                <span>รวมทั้งสิ้น</span>
                <span className="text-primary text-lg">
                  {formatPrice(calculations.rentGrandTotal)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">ข้อดีของการเช่ารายเดือน:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>- ยืดหยุ่น เลิกได้ทุกเมื่อ</li>
                <li>- ไม่ต้องรับผิดชอบเมื่ออุปกรณ์ล้าสมัย</li>
                <li>- เหมาะกับโครงการระยะสั้น</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="lease" className="space-y-4 mt-4">
            {leaseToOwnPrice && leaseDuration ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ค่าเช่าซื้อรายเดือน</span>
                    <span>{formatPrice(calculations.leaseMonthly * quantity)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ระยะเวลา</span>
                    <span>{leaseDuration} เดือน</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ราคาเช่าซื้อทั้งหมด</span>
                    <span>{formatPrice(calculations.leaseTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ค่ามัดจำ</span>
                    <span>{formatPrice(calculations.leaseDeposit)}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>รวมทั้งสิ้น</span>
                    <span className="text-secondary text-lg">
                      {formatPrice(calculations.leaseGrandTotal)}
                    </span>
                  </div>
                </div>

                {calculations.savings > 0 && rentMonths >= leaseDuration && (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    ประหยัดกว่าเช่า {rentMonths} เดือน{" "}
                    {formatPrice(Math.abs(calculations.savings))} (
                    {Math.abs(calculations.savingsPercent).toFixed(0)}%)
                  </Badge>
                )}

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">ข้อดีของการเช่าซื้อ:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>- ได้เป็นเจ้าของเมื่อครบสัญญา</li>
                    <li>- ราคาต่อเดือนถูกกว่าเช่ารายเดือน</li>
                    <li>- เหมาะกับการใช้งานระยะยาว</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                ไม่มีตัวเลือกเช่าซื้อสำหรับอุปกรณ์นี้
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
