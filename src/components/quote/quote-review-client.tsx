"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import {
  calcRentalTotal,
  clearCart,
  getCart,
  onCartChange,
  removeItem,
  unitLabels,
  updateItem,
  type DurationUnit,
  type QuoteCartItem,
} from "@/lib/quote-cart";

interface Prefill {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  organization: string;
  billingAddress: string;
}

interface IssuedQuotation {
  quoteNumber: string;
  providerName: string;
  pdfUrl: string | null;
}

const durationUnits: DurationUnit[] = ["day", "month", "year"];

export function QuoteReviewClient({ prefill }: { prefill: Prefill }) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [contact, setContact] = useState({ ...prefill, notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IssuedQuotation[] | null>(null);

  useEffect(() => {
    setMounted(true);
    const sync = () => setItems(getCart());
    sync();
    return onCartChange(sync);
  }, []);

  // Group items by provider — one quotation per provider on submit.
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { providerName: string; items: QuoteCartItem[] }
    >();
    for (const item of items) {
      const g = map.get(item.provider.id) ?? {
        providerName: item.provider.companyName,
        items: [],
      };
      g.items.push(item);
      map.set(item.provider.id, g);
    }
    return Array.from(map.values());
  }, [items]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const rental = calcRentalTotal(item);
        const deposit = item.depositAmount * item.quantity;
        return {
          rentalTotal: acc.rentalTotal + rental,
          depositTotal: acc.depositTotal + deposit,
          total: acc.total + rental + deposit,
        };
      },
      { rentalTotal: 0, depositTotal: 0, total: 0 }
    );
  }, [items]);

  const setField = (key: keyof typeof contact, value: string) =>
    setContact((c) => ({ ...c, [key]: value }));

  const canSubmit =
    items.length > 0 &&
    contact.contactName.trim() &&
    contact.contactEmail.trim() &&
    contact.contactPhone.trim() &&
    contact.billingAddress.trim() &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact,
          items: items.map((i) => ({
            equipmentId: i.equipmentId,
            quantity: i.quantity,
            durationAmount: i.durationAmount,
            durationUnit: i.durationUnit,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "เกิดข้อผิดพลาดในการออกใบเสนอราคา");
      }
      setResult(data.quotations as IssuedQuotation[]);
      clearCart();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  // Avoid hydration mismatch: cart comes from localStorage.
  if (!mounted) return null;

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle>ออกใบเสนอราคาเรียบร้อยแล้ว</CardTitle>
            <CardDescription>
              ส่งใบเสนอราคาให้ผู้ให้บริการแล้ว {result.length} ฉบับ
              คุณสามารถดาวน์โหลด PDF ได้ที่นี่
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.map((q) => (
              <div
                key={q.quoteNumber}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{q.providerName}</p>
                  <p className="text-sm text-muted-foreground">{q.quoteNumber}</p>
                </div>
                {q.pdfUrl ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={q.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-1.5 h-4 w-4" />
                      ดาวน์โหลด PDF
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    กำลังสร้าง PDF
                  </span>
                )}
              </div>
            ))}
            <Button asChild className="mt-2">
              <Link href="/product">เลือกอุปกรณ์เพิ่ม</Link>
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
          <h1 className="text-2xl font-bold">ออกใบเสนอราคา</h1>
          <p className="text-muted-foreground">
            ตรวจสอบรายการ กรอกข้อมูลผู้เช่า แล้วออกใบเสนอราคาแยกตามผู้ให้บริการ
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/product">
            <ArrowLeft className="mr-2 h-4 w-4" />
            เลือกอุปกรณ์เพิ่ม
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            ยังไม่มีอุปกรณ์ในใบเสนอราคา — กลับไปเลือกอุปกรณ์จากหน้าสินค้าก่อน
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          {/* Left: grouped items + contact */}
          <div className="space-y-6">
            {groups.map((group) => (
              <Card key={group.providerName}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.providerName}</CardTitle>
                  <CardDescription>
                    ใบเสนอราคา 1 ฉบับสำหรับผู้ให้บริการรายนี้
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.items.map((item) => (
                    <div
                      key={item.equipmentId}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {item.nameTh || item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.rentPriceMonthly)}/เดือน · มัดจำ{" "}
                            {formatPrice(item.depositAmount)}
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

                      <div className="flex flex-wrap items-end gap-4">
                        {/* Quantity */}
                        <div className="space-y-1">
                          <Label className="text-xs">จำนวน</Label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() =>
                                updateItem(item.equipmentId, {
                                  quantity: item.quantity - 1,
                                })
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() =>
                                updateItem(item.equipmentId, {
                                  quantity: item.quantity + 1,
                                })
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-1">
                          <Label className="text-xs">ระยะเวลา</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.durationAmount}
                              onChange={(e) =>
                                updateItem(item.equipmentId, {
                                  durationAmount: parseInt(e.target.value) || 1,
                                })
                              }
                              className="h-8 w-16"
                            />
                            <select
                              value={item.durationUnit}
                              onChange={(e) =>
                                updateItem(item.equipmentId, {
                                  durationUnit: e.target.value as DurationUnit,
                                })
                              }
                              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                            >
                              {durationUnits.map((u) => (
                                <option key={u} value={u}>
                                  {unitLabels[u]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="ml-auto text-right">
                          <p className="text-xs text-muted-foreground">รวม</p>
                          <p className="font-semibold">
                            {formatPrice(calcRentalTotal(item))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลผู้เช่า</CardTitle>
                <CardDescription>
                  ข้อมูลนี้จะปรากฏบนใบเสนอราคา
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="ชื่อผู้ติดต่อ" required>
                  <Input
                    value={contact.contactName}
                    onChange={(e) => setField("contactName", e.target.value)}
                    required
                  />
                </Field>
                <Field label="เบอร์ติดต่อ" required>
                  <Input
                    value={contact.contactPhone}
                    onChange={(e) => setField("contactPhone", e.target.value)}
                    inputMode="tel"
                    required
                  />
                </Field>
                <Field label="อีเมล" required>
                  <Input
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => setField("contactEmail", e.target.value)}
                    required
                  />
                </Field>
                <Field label="โรงเรียน/หน่วยงาน">
                  <Input
                    value={contact.organization}
                    onChange={(e) => setField("organization", e.target.value)}
                  />
                </Field>
                <Field label="ที่อยู่สำหรับออกเอกสาร" required className="md:col-span-2">
                  <Textarea
                    value={contact.billingAddress}
                    onChange={(e) => setField("billingAddress", e.target.value)}
                    placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                    required
                  />
                </Field>
                <Field label="หมายเหตุเพิ่มเติม" className="md:col-span-2">
                  <Textarea
                    value={contact.notes}
                    onChange={(e) => setField("notes", e.target.value)}
                    placeholder="รายละเอียดอื่นๆ ที่ต้องการแจ้งผู้ให้บริการ"
                  />
                </Field>
              </CardContent>
            </Card>
          </div>

          {/* Right: summary */}
          <aside>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>สรุปยอด</CardTitle>
                <CardDescription>
                  {groups.length} ใบเสนอราคา · {items.length} รายการ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <Row label="ค่าเช่าตามระยะเวลา" value={formatPrice(totals.rentalTotal)} />
                  <Row label="มัดจำรวม" value={formatPrice(totals.depositTotal)} />
                  <Separator />
                  <Row
                    label="ยอดรวมประมาณการ"
                    value={formatPrice(totals.total)}
                    className="text-base font-semibold"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!canSubmit}>
                  <FileText className="mr-2 h-4 w-4" />
                  {submitting ? "กำลังออกใบเสนอราคา..." : "ออกใบเสนอราคา"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  ระบบจะออกใบเสนอราคาแยกตามผู้ให้บริการ และส่งให้ผู้ให้บริการแต่ละราย
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-between gap-4 ${className ?? ""}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
