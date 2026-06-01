"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";

interface CartEquipment {
  id: string;
  name: string;
  nameTh?: string | null;
  rentPriceMonthly: number;
  depositAmount: number;
  provider: {
    companyName: string;
  };
}

interface CartItem {
  equipment: CartEquipment;
  quantity: number;
  durationAmount: number;
  durationUnit: "day" | "month" | "year";
}

interface MockSubmission {
  quoteNumber: string;
  submittedAt: Date;
}

const CART_STORAGE_KEY = "jwc-customer-equipment-cart";

const unitLabels: Record<CartItem["durationUnit"], string> = {
  day: "วัน",
  month: "เดือน",
  year: "ปี",
};

export function QuoteRequestForm() {
  const [cart] = useState<CartItem[]>(() => {
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
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [acceptedDeposit, setAcceptedDeposit] = useState(false);
  const [submission, setSubmission] = useState<MockSubmission | null>(null);

  const totals = useMemo(() => {
    return cart.reduce(
      (summary, item) => {
        const rentalTotal = calculateRentalTotal(item);
        const depositTotal = item.equipment.depositAmount * item.quantity;

        return {
          itemCount: summary.itemCount + item.quantity,
          rentalTotal: summary.rentalTotal + rentalTotal,
          depositTotal: summary.depositTotal + depositTotal,
          estimatedTotal: summary.estimatedTotal + rentalTotal + depositTotal,
        };
      },
      { itemCount: 0, rentalTotal: 0, depositTotal: 0, estimatedTotal: 0 }
    );
  }, [cart]);

  const canSubmit = cart.length > 0 && hasReadAgreement && acceptedAgreement && acceptedDeposit;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmission({
      quoteNumber: `QT-MOCK-${Date.now().toString().slice(-8)}`,
      submittedAt: new Date(),
    });
  };

  if (submission) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle>ส่งคำขอใบเสนอราคา Mock แล้ว</CardTitle>
            <CardDescription>
              เลขที่ {submission.quoteNumber} - ข้อมูลนี้ยังไม่ถูกบันทึกหรือส่งเข้าระบบจริง
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm">
              <SummaryRow label="วันที่ส่ง" value={submission.submittedAt.toLocaleDateString("th-TH")} />
              <SummaryRow label="จำนวนอุปกรณ์" value={`${totals.itemCount} ชิ้น`} />
              <SummaryRow label="ยอดมัดจำ" value={formatPrice(totals.depositTotal)} />
              <SummaryRow label="ยอดรวมประมาณการ" value={formatPrice(totals.estimatedTotal)} />
            </div>
            <Button asChild>
              <Link href="/dashboard/customer/browse">กลับไปค้นหาอุปกรณ์</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ขอใบเสนอราคา</h1>
          <p className="text-muted-foreground">
            กรอกข้อมูลผู้เช่า ตรวจสอบสัญญา และยืนยันมัดจำแบบ Mock
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/customer/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปที่รถเข็น
          </Link>
        </Button>
      </div>

      {cart.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ยังไม่มีอุปกรณ์ในรถเข็น</AlertTitle>
          <AlertDescription>
            กลับไปเลือกอุปกรณ์ก่อน แล้วค่อยเปิดหน้านี้เพื่อสร้างใบเสนอราคา Mock
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>ข้อมูลนี้ใช้สำหรับแสดงในใบเสนอราคา Mock เท่านั้น</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="ชื่อ" id="firstName" required>
                <Input id="firstName" name="firstName" required placeholder="ชื่อจริง" />
              </Field>
              <Field label="นามสกุล" id="lastName" required>
                <Input id="lastName" name="lastName" required placeholder="นามสกุล" />
              </Field>
              <Field label="เลขบัตรประชาชน" id="nationalId" required>
                <Input
                  id="nationalId"
                  name="nationalId"
                  required
                  inputMode="numeric"
                  minLength={13}
                  maxLength={13}
                  placeholder="13 หลัก"
                />
              </Field>
              <Field label="เบอร์ติดต่อ" id="phone" required>
                <Input id="phone" name="phone" required inputMode="tel" placeholder="08x-xxx-xxxx" />
              </Field>
              <Field label="อีเมล" id="email" required>
                <Input id="email" name="email" type="email" required placeholder="name@example.com" />
              </Field>
              <Field label="โรงเรียน/หน่วยงาน" id="organization">
                <Input id="organization" name="organization" placeholder="ชื่อสถานศึกษา" />
              </Field>
              <Field label="ที่อยู่สำหรับเอกสาร" id="billingAddress" className="md:col-span-2" required>
                <Textarea id="billingAddress" name="billingAddress" required placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
              </Field>
              <Field label="หมายเหตุเพิ่มเติม" id="notes" className="md:col-span-2">
                <Textarea id="notes" name="notes" placeholder="ช่วงเวลาที่ต้องการให้ติดต่อ หรือรายละเอียดอื่นๆ" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>การวางมัดจำเครื่อง</CardTitle>
              <CardDescription>เลือกวิธีชำระเงินมัดจำแบบ Mock</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4">
                <SummaryRow label="ยอดมัดจำรวม" value={formatPrice(totals.depositTotal)} className="font-semibold" />
              </div>
              <RadioGroup defaultValue="bank-transfer" name="depositMethod" className="grid gap-3 md:grid-cols-3">
                <DepositOption id="bank-transfer" label="โอนบัญชี" description="แนบหลักฐานภายหลัง" />
                <DepositOption id="credit-card" label="บัตรเครดิต" description="Mock authorization" />
                <DepositOption id="invoice" label="ใบแจ้งหนี้" description="สำหรับหน่วยงาน" />
              </RadioGroup>
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox
                  id="acceptedDeposit"
                  checked={acceptedDeposit}
                  onCheckedChange={(checked) => setAcceptedDeposit(checked === true)}
                />
                <Label htmlFor="acceptedDeposit" className="block leading-6">
                  ยอมรับเงื่อนไขการวางมัดจำ และรับทราบว่ายอดมัดจำนี้เป็นข้อมูล Mock
                  สำหรับการออกใบเสนอราคาเท่านั้น
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>สัญญาการเช่ายืม</CardTitle>
              <CardDescription>ต้องเลื่อนอ่านสัญญาจนจบก่อนจึงจะติ๊กยอมรับได้</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="h-72 overflow-y-auto rounded-lg border bg-muted/30 p-4 text-sm leading-7"
                onScroll={(event) => {
                  const element = event.currentTarget;
                  const reachedBottom =
                    element.scrollTop + element.clientHeight >= element.scrollHeight - 8;
                  if (reachedBottom) setHasReadAgreement(true);
                }}
              >
                <RentalAgreement />
              </div>
              {!hasReadAgreement && (
                <p className="text-sm text-muted-foreground">
                  กรุณาเลื่อนอ่านสัญญาจนจบเพื่อเปิดการยอมรับเงื่อนไข
                </p>
              )}
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox
                  id="acceptedAgreement"
                  checked={acceptedAgreement}
                  disabled={!hasReadAgreement}
                  onCheckedChange={(checked) => setAcceptedAgreement(checked === true)}
                />
                <Label htmlFor="acceptedAgreement" className="block leading-6">
                  ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขสัญญาการเช่ายืมอุปกรณ์ทั้งหมด
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>สรุปรายการ</CardTitle>
              <CardDescription>{cart.length} รายการในรถเข็น</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.equipment.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.equipment.nameTh || item.equipment.name}</p>
                        <p className="text-muted-foreground">{item.equipment.provider.companyName}</p>
                      </div>
                      <Badge variant="secondary">x{item.quantity}</Badge>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {item.durationAmount} {unitLabels[item.durationUnit]} -{" "}
                      {formatPrice(calculateRentalTotal(item))}
                    </p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <SummaryRow label="ค่าเช่าตามระยะเวลา" value={formatPrice(totals.rentalTotal)} />
                <SummaryRow label="มัดจำเครื่อง" value={formatPrice(totals.depositTotal)} />
                <SummaryRow
                  label="ยอดรวมประมาณการ"
                  value={formatPrice(totals.estimatedTotal)}
                  className="text-base font-semibold"
                />
              </div>
              <Button className="w-full" type="submit" disabled={!canSubmit}>
                <FileText className="mr-2 h-4 w-4" />
                ส่งคำขอใบเสนอราคา Mock
              </Button>
              <p className="text-xs text-muted-foreground">
                ปุ่มจะเปิดเมื่อมีอุปกรณ์ อ่านสัญญาจนครบ ยอมรับสัญญา และยอมรับมัดจำแล้ว
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  required,
  className,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function DepositOption({
  id,
  label,
  description,
}: {
  id: string;
  label: string;
  description: string;
}) {
  return (
    <Label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
      <RadioGroupItem id={id} value={id} className="mt-0.5" />
      <span>
        <span className="flex items-center gap-2 font-medium">
          <CreditCard className="h-4 w-4" />
          {label}
        </span>
        <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
      </span>
    </Label>
  );
}

function RentalAgreement() {
  return (
    <div className="space-y-4">
      <p className="font-semibold">สัญญาการเช่ายืมอุปกรณ์เพื่อการศึกษา (Mock)</p>
      <p>
        ผู้เช่าตกลงใช้อุปกรณ์ตามวัตถุประสงค์ด้านการเรียนการสอนเท่านั้น และจะดูแลรักษา
        อุปกรณ์ให้อยู่ในสภาพเหมาะสมตลอดระยะเวลาการเช่า
      </p>
      <p>
        ผู้เช่าต้องตรวจรับอุปกรณ์เมื่อได้รับสินค้า หากพบความเสียหายต้องแจ้งผู้ให้บริการ
        ภายใน 24 ชั่วโมงนับจากเวลารับมอบ มิฉะนั้นถือว่าอุปกรณ์อยู่ในสภาพพร้อมใช้งาน
      </p>
      <p>
        เงินมัดจำใช้เป็นหลักประกันความเสียหาย การสูญหาย หรือค่าใช้จ่ายที่เกิดจากการใช้งาน
        ผิดเงื่อนไข โดยจำนวนเงินที่แสดงในหน้านี้เป็นยอดประมาณการแบบ Mock เท่านั้น
      </p>
      <p>
        ผู้เช่าต้องคืนอุปกรณ์ตามกำหนดเวลา หากคืนล่าช้าอาจมีค่าปรับหรือค่าเช่าเพิ่มเติม
        ตามเงื่อนไขของผู้ให้บริการแต่ละราย
      </p>
      <p>
        ห้ามดัดแปลง แกะ ซ่อม หรือโอนย้ายอุปกรณ์ให้บุคคลอื่นโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
        จากผู้ให้บริการ
      </p>
      <p>
        เมื่อสิ้นสุดสัญญา ผู้ให้บริการจะตรวจสอบสภาพอุปกรณ์ก่อนคืนเงินมัดจำ หากไม่มีความเสียหาย
        เงินมัดจำจะถูกคืนตามขั้นตอนที่ตกลงกัน
      </p>
      <p>
        เอกสารนี้เป็นข้อความจำลองสำหรับการออกแบบหน้าฟอร์มเท่านั้น ยังไม่มีผลทางกฎหมาย
        และยังไม่ใช่การทำสัญญาจริงในระบบ
      </p>
      <div className="flex items-center gap-2 rounded-lg border bg-background p-3 font-medium">
        <ShieldCheck className="h-4 w-4 text-primary" />
        อ่านครบแล้วจึงจะสามารถยอมรับเงื่อนไขได้
      </div>
    </div>
  );
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
    <div className={className ? `flex justify-between gap-4 ${className}` : "flex justify-between gap-4"}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
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

function normalizeSavedCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const cartItem = item as Partial<CartItem> & { months?: number };
    if (!cartItem.equipment || typeof cartItem.quantity !== "number") return [];

    const durationUnit = isDurationUnit(cartItem.durationUnit) ? cartItem.durationUnit : "month";
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
        durationAmount: Math.max(1, durationAmount),
      },
    ];
  });
}

function isDurationUnit(value: unknown): value is CartItem["durationUnit"] {
  return value === "day" || value === "month" || value === "year";
}
