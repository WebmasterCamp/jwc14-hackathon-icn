import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { ReceiptText, Download } from "lucide-react";
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

export default async function AccountQuotationsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const quotations = await prisma.quotation.findMany({
    where: { customer: { userId: session.user.id } },
    include: { provider: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>ใบเสนอราคาของฉัน</CardTitle>
        <CardDescription>{quotations.length} ใบเสนอราคา</CardDescription>
      </CardHeader>
      <CardContent>
        {quotations.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <ReceiptText className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p className="mb-4">ยังไม่มีใบเสนอราคา</p>
            <Button asChild>
              <Link href="/product">เลือกดูอุปกรณ์</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่</TableHead>
                <TableHead>ผู้ให้บริการ</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead className="text-center">รายการ</TableHead>
                <TableHead className="text-right">ยอดรวม</TableHead>
                <TableHead className="text-center">สถานะ</TableHead>
                <TableHead className="text-right">PDF</TableHead>
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
                    <TableCell>{q.provider.companyName}</TableCell>
                    <TableCell>
                      {formatThaiDate(q.createdAt, "d MMM yyyy", "BE")}
                    </TableCell>
                    <TableCell className="text-center">{q.items.length}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(q.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {q.pdfUrl ? (
                        <Button size="icon" variant="ghost" asChild>
                          <a
                            href={q.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
