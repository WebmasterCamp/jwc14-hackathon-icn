import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { ReceiptText, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, formatThaiDate } from "@/lib/format";

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "ร่าง", variant: "outline" },
  SENT: { label: "ส่งแล้ว", variant: "default" },
  VIEWED: { label: "เปิดอ่านแล้ว", variant: "secondary" },
  ACCEPTED: { label: "ตอบรับ", variant: "default" },
  REJECTED: { label: "ปฏิเสธ", variant: "destructive" },
  EXPIRED: { label: "หมดอายุ", variant: "outline" },
};

export default async function ProviderQuotationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      quotations: {
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!provider) redirect("/login");

  const quotations = provider.quotations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ใบเสนอราคา</h1>
        <p className="text-muted-foreground">
          คำขอใบเสนอราคาที่ลูกค้าส่งถึงร้านของคุณ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการทั้งหมด</CardTitle>
          <CardDescription>{quotations.length} ใบเสนอราคา</CardDescription>
        </CardHeader>
        <CardContent>
          {quotations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ReceiptText className="mx-auto mb-3 h-10 w-10 opacity-40" />
              ยังไม่มีใบเสนอราคา
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="text-center">รายการ</TableHead>
                  <TableHead className="text-right">ยอดรวม</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((q) => {
                  const status = statusLabels[q.status] ?? {
                    label: q.status,
                    variant: "outline" as const,
                  };
                  return (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.quoteNumber}</TableCell>
                      <TableCell>
                        <div>{q.organization || q.contactName}</div>
                        <div className="text-xs text-muted-foreground">
                          {q.contactPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatThaiDate(q.createdAt, "d MMM yyyy", "BE")}
                      </TableCell>
                      <TableCell className="text-center">
                        {q.items.length}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(q.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" asChild>
                            <Link href={`/dashboard/provider/quotations/${q.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {q.pdfUrl && (
                            <Button size="icon" variant="ghost" asChild>
                              <a
                                href={q.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
