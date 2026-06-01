"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  X,
  MapPin,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/format";

export interface BrowseEquipment {
  id: string;
  name: string;
  nameTh?: string | null;
  description?: string | null;
  images: string[];
  rentPriceMonthly: number;
  leaseToOwnPrice?: number | null;
  depositAmount: number;
  availableStock: number;
  condition: string;
  category: {
    name: string;
    nameTh: string;
  };
  provider: {
    companyName: string;
    province?: string | null;
    rating: number;
  };
}

interface CartItem {
  equipment: BrowseEquipment;
  quantity: number;
  durationAmount: number;
  durationUnit: RentalUnit;
}

interface CustomerBrowseClientProps {
  equipment: BrowseEquipment[];
  totalCount?: number;
}

interface CartTotals {
  itemCount: number;
  monthlyTotal: number;
  depositTotal: number;
  rentalTotal: number;
  estimatedTotal: number;
}

const CART_STORAGE_KEY = "jwc-customer-equipment-cart";

type RentalUnit = "day" | "month" | "year";

const rentalUnitLabels: Record<RentalUnit, string> = {
  day: "วัน",
  month: "เดือน",
  year: "ปี",
};

const conditionLabels: Record<string, string> = {
  NEW: "ใหม่",
  EXCELLENT: "ดีเยี่ยม",
  GOOD: "ดี",
  FAIR: "พอใช้",
};

export function CustomerBrowseClient({ equipment, totalCount = equipment.length }: CustomerBrowseClientProps) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    try {
      return normalizeSavedCart(JSON.parse(savedCart));
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const totals = useMemo(() => {
    return cart.reduce(
      (summary, item) => {
        const monthly = item.equipment.rentPriceMonthly * item.quantity;
        const deposit = item.equipment.depositAmount * item.quantity;
        const rentalTotal = calculateRentalTotal(item);

        return {
          itemCount: summary.itemCount + item.quantity,
          monthlyTotal: summary.monthlyTotal + monthly,
          depositTotal: summary.depositTotal + deposit,
          rentalTotal: summary.rentalTotal + rentalTotal,
          estimatedTotal: summary.estimatedTotal + rentalTotal + deposit,
        };
      },
      { itemCount: 0, monthlyTotal: 0, depositTotal: 0, rentalTotal: 0, estimatedTotal: 0 }
    );
  }, [cart]);

  const addToCart = (item: BrowseEquipment) => {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.equipment.id === item.id);

      if (existing) {
        return current.map((cartItem) =>
          cartItem.equipment.id === item.id
            ? {
                ...cartItem,
                quantity: Math.min(cartItem.quantity + 1, item.availableStock),
              }
            : cartItem
        );
      }

      return [...current, { equipment: item, quantity: 1, durationAmount: 1, durationUnit: "month" }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (equipmentId: string, quantity: number) => {
    setCart((current) =>
      current.map((item) =>
        item.equipment.id === equipmentId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.equipment.availableStock)),
            }
          : item
      )
    );
  };

  const updateDurationAmount = (equipmentId: string, durationAmount: number) => {
    setCart((current) =>
      current.map((item) =>
        item.equipment.id === equipmentId
          ? { ...item, durationAmount: Math.max(1, Math.min(durationAmount, getMaxDuration(item.durationUnit))) }
          : item
      )
    );
  };

  const updateDurationUnit = (equipmentId: string, durationUnit: RentalUnit) => {
    setCart((current) =>
      current.map((item) =>
        item.equipment.id === equipmentId
          ? {
              ...item,
              durationUnit,
              durationAmount: Math.min(item.durationAmount, getMaxDuration(durationUnit)),
            }
          : item
      )
    );
  };

  const removeItem = (equipmentId: string) => {
    setCart((current) => current.filter((item) => item.equipment.id !== equipmentId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          พบ <span className="font-medium text-foreground">{totalCount}</span> รายการ
        </p>
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              รถเข็น
              {totals.itemCount > 0 && (
                <span className="ml-2 rounded-full bg-primary-foreground px-2 py-0.5 text-xs text-primary">
                  {totals.itemCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>รถเข็นอุปกรณ์</SheetTitle>
            </SheetHeader>
            <CartPanel
              cart={cart}
              totals={totals}
              onQuantityChange={updateQuantity}
              onDurationAmountChange={updateDurationAmount}
              onDurationUnitChange={updateDurationUnit}
              onRemove={removeItem}
              onClear={() => setCart([])}
            />
          </SheetContent>
        </Sheet>
      </div>

      {equipment.length === 0 ? (
        <div className="rounded-lg border bg-card py-16 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-medium">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข</p>
          <p className="text-sm text-muted-foreground">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {equipment.map((item) => (
            <BrowseCard key={item.id} equipment={item} onAddToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

function BrowseCard({
  equipment,
  onAddToCart,
}: {
  equipment: BrowseEquipment;
  onAddToCart: (equipment: BrowseEquipment) => void;
}) {
  const imageUrl = equipment.images[0] || "/images/placeholder-equipment.svg";
  const unavailable = equipment.availableStock <= 0;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/equipment/${equipment.id}`}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={equipment.nameTh || equipment.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute left-2 top-2 flex gap-2">
            <Badge variant="secondary">{equipment.category.nameTh}</Badge>
          </div>
          {equipment.availableStock <= 3 && equipment.availableStock > 0 && (
            <Badge variant="destructive" className="absolute right-2 top-2">
              เหลือ {equipment.availableStock} ชิ้น
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/equipment/${equipment.id}`}>
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
            {equipment.nameTh || equipment.name}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {equipment.description}
        </p>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(equipment.rentPriceMonthly)}
          </span>
          <span className="text-muted-foreground">/เดือน</span>
        </div>
        {equipment.leaseToOwnPrice && (
          <p className="text-sm text-muted-foreground">
            หรือเช่าซื้อ {formatPrice(equipment.leaseToOwnPrice)}
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-2 p-4 pt-0">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/equipment/${equipment.id}`}>ดูรายละเอียด</Link>
        </Button>
        <Button className="flex-1" onClick={() => onAddToCart(equipment)} disabled={unavailable}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {unavailable ? "หมด" : "ใส่รถเข็น"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function CartPanel({
  cart,
  totals,
  onQuantityChange,
  onDurationAmountChange,
  onDurationUnitChange,
  onRemove,
  onClear,
}: {
  cart: CartItem[];
  totals: CartTotals;
  onQuantityChange: (equipmentId: string, quantity: number) => void;
  onDurationAmountChange: (equipmentId: string, durationAmount: number) => void;
  onDurationUnitChange: (equipmentId: string, durationUnit: RentalUnit) => void;
  onRemove: (equipmentId: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col">
      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-medium">รถเข็นยังว่างอยู่</p>
          <p className="text-sm text-muted-foreground">เลือกอุปกรณ์เพื่อคำนวณราคาเบื้องต้น</p>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.equipment.id} className="rounded-lg border p-4">
                <div className="flex gap-3">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.equipment.images[0] || "/images/placeholder-equipment.svg"}
                      alt={item.equipment.nameTh || item.equipment.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-1 font-medium">
                          {item.equipment.nameTh || item.equipment.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.equipment.rentPriceMonthly)}/เดือน
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => onRemove(item.equipment.id)}
                        aria-label="Remove from cart"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <QuantityControl
                    label="จำนวน"
                    value={item.quantity}
                    min={1}
                    max={item.equipment.availableStock}
                    onChange={(value) => onQuantityChange(item.equipment.id, value)}
                  />
                  <DurationControl
                    amount={item.durationAmount}
                    unit={item.durationUnit}
                    onAmountChange={(value) => onDurationAmountChange(item.equipment.id, value)}
                    onUnitChange={(value) => onDurationUnitChange(item.equipment.id, value)}
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  ระยะเวลา {item.durationAmount} {rentalUnitLabels[item.durationUnit]} -{" "}
                  {formatPrice(calculateRentalTotal(item))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t pt-4">
            <div className="space-y-2 text-sm">
              <SummaryRow label="ค่าเช่าต่อเดือน" value={formatPrice(totals.monthlyTotal)} />
              <SummaryRow label="ค่าเช่าตามระยะเวลา" value={formatPrice(totals.rentalTotal)} />
              <SummaryRow label="เงินประกัน" value={formatPrice(totals.depositTotal)} />
              <Separator />
              <SummaryRow
                label="ประมาณการรวม"
                value={formatPrice(totals.estimatedTotal)}
                className="text-base font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={onClear}>
                <Trash2 className="mr-2 h-4 w-4" />
                ล้างรถเข็น
              </Button>
              <Button asChild>
                <Link href="/dashboard/customer/browse/quote">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  ขอใบเสนอราคา
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              รถเข็นนี้เป็นการคำนวณบนหน้าเว็บเท่านั้น โดยประมาณรายวันจากราคาเดือน/30
              และรายปีจากราคาเดือน x 12 ยังไม่มีการส่งข้อมูลหรือสร้างสัญญา
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function DurationControl({
  amount,
  unit,
  onAmountChange,
  onUnitChange,
}: {
  amount: number;
  unit: RentalUnit;
  onAmountChange: (value: number) => void;
  onUnitChange: (value: RentalUnit) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">ระยะเวลา</p>
      <div className="grid grid-cols-[1fr_92px] gap-2">
        <QuantityControl
          label=""
          value={amount}
          min={1}
          max={getMaxDuration(unit)}
          onChange={onAmountChange}
          hideLabel
        />
        <Select value={unit} onValueChange={(value) => onUnitChange(value as RentalUnit)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">วัน</SelectItem>
            <SelectItem value="month">เดือน</SelectItem>
            <SelectItem value="year">ปี</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function QuantityControl({
  label,
  value,
  min,
  max,
  onChange,
  hideLabel = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  hideLabel?: boolean;
}) {
  return (
    <div>
      {!hideLabel && <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex h-9 items-center rounded-md border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-8 flex-1 text-center text-sm font-medium">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function calculateRentalTotal(item: CartItem) {
  const monthly = item.equipment.rentPriceMonthly * item.quantity;

  if (item.durationUnit === "day") {
    return (monthly / 30) * item.durationAmount;
  }

  if (item.durationUnit === "year") {
    return monthly * 12 * item.durationAmount;
  }

  return monthly * item.durationAmount;
}

function getMaxDuration(unit: RentalUnit) {
  if (unit === "day") return 365;
  if (unit === "year") return 5;
  return 60;
}

function normalizeSavedCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const cartItem = item as Partial<CartItem> & { months?: number };
    if (!cartItem.equipment || typeof cartItem.quantity !== "number") return [];

    const durationUnit = isRentalUnit(cartItem.durationUnit) ? cartItem.durationUnit : "month";
    const durationAmount =
      typeof cartItem.durationAmount === "number"
        ? cartItem.durationAmount
        : typeof cartItem.months === "number"
          ? cartItem.months
          : 1;

    return [
      {
        equipment: cartItem.equipment,
        quantity: Math.max(1, cartItem.quantity),
        durationUnit,
        durationAmount: Math.max(1, Math.min(durationAmount, getMaxDuration(durationUnit))),
      },
    ];
  });
}

function isRentalUnit(value: unknown): value is RentalUnit {
  return value === "day" || value === "month" || value === "year";
}

function SummaryRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className ? `flex justify-between ${className}` : "flex justify-between"}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
