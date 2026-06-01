import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatThaiDate } from "@/lib/format";
import { unitLabels, type DurationUnit } from "@/lib/quote-cart";

const statusLabels: Record<string, string> = {
  DRAFT: "ร่าง",
  SENT: "ส่งแล้ว",
  VIEWED: "เปิดอ่านแล้ว",
  ACCEPTED: "ตอบรับ",
  REJECTED: "ปฏิเสธ",
  EXPIRED: "หมดอายุ",
};

export default async function ProviderQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!provider) redirect("/login");

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });

  // Scope: a provider may only view their own quotations.
  if (!quotation || quotation.providerId !== provider.id) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/provider/quotations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Link>
        </Button>
        {quotation.pdfUrl && (
          <Button variant="outline" asChild>
            <a href={quotation.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลด PDF
            </a>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{quotation.quoteNumber}</h1>
        <Badge variant="secondary">
          {statusLabels[quotation.status] ?? quotation.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลผู้ขอ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{quotation.contactName}</p>
            {quotation.organization && <p>{quotation.organization}</p>}
            <p className="text-muted-foreground">{quotation.billingAddress}</p>
            <p className="text-muted-foreground">
              {quotation.contactPhone} · {quotation.contactEmail}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">รายละเอียด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              วันที่ออก:{" "}
              {formatThaiDate(quotation.createdAt, "d MMMM yyyy", "BE")}
            </p>
            <p>
              ยืนราคาถึง:{" "}
              {formatThaiDate(quotation.validUntil, "d MMMM yyyy", "BE")}
            </p>
            {quotation.notes && (
              <p className="text-muted-foreground">หมายเหตุ: {quotation.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายการอุปกรณ์</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รายการ</TableHead>
                <TableHead className="text-center">จำนวน</TableHead>
                <TableHead className="text-center">ระยะเวลา</TableHead>
                <TableHead className="text-right">ราคา/เดือน</TableHead>
                <TableHead className="text-right">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotation.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nameTh || item.name}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">
                    {item.durationAmount}{" "}
                    {unitLabels[item.durationUnit as DurationUnit] ??
                      item.durationUnit}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.rentPriceMonthly)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ค่าเช่าตามระยะเวลา</span>
              <span>{formatPrice(quotation.rentalTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">มัดจำรวม</span>
              <span>{formatPrice(quotation.depositTotal)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>ยอดรวมประมาณการ</span>
              <span>{formatPrice(quotation.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
