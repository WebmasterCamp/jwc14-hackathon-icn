import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  GraduationCap,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatThaiDate } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "ร่าง",
  PENDING_APPROVAL: "รออนุมัติ",
  ACTIVE: "ใช้งาน",
  SUSPENDED: "ระงับ",
  COMPLETED: "เสร็จสิ้น",
  TERMINATED: "ยกเลิก",
  CANCELLED: "ยกเลิก",
  OVERDUE: "เกินกำหนด",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "รอชำระ",
  PAID: "ชำระแล้ว",
  OVERDUE: "เกินกำหนด",
  FAILED: "ล้มเหลว",
};

export default async function ProviderContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!provider) redirect("/login");

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          user: { select: { name: true, email: true, phone: true } },
        },
      },
      items: { include: { equipment: { include: { category: true } } } },
      payments: { orderBy: { dueDate: "asc" } },
    },
  });

  // Ownership guard: a provider may only view their own contracts.
  if (!contract || contract.providerId !== provider.id) {
    notFound();
  }

  const paidPayments = contract.payments.filter((p) => p.status === "PAID");
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const paymentProgress =
    contract.totalAmount > 0 ? (totalPaid / contract.totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/provider/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">รายละเอียดสัญญา</h1>
            <p className="text-muted-foreground font-mono">
              {contract.contractNumber}
            </p>
          </div>
        </div>
        <Badge
          variant={
            contract.status === "ACTIVE"
              ? "default"
              : contract.status === "PENDING_APPROVAL"
              ? "outline"
              : "secondary"
          }
        >
          {STATUS_LABELS[contract.status]}
        </Badge>
      </div>

      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            สถานศึกษา
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">ชื่อสถานศึกษา</p>
            <p className="font-medium">{contract.customer.schoolName}</p>
          </div>
          {contract.customer.province && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {contract.customer.province}
            </div>
          )}
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {contract.customer.user.email}
            </div>
            {contract.customer.user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {contract.customer.user.phone}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดสัญญา</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">ประเภทสัญญา</p>
              <p className="font-medium">
                {contract.type === "RENT" ? "เช่า" : "เช่าซื้อ"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันที่เริ่มต้น</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {formatThaiDate(contract.startDate, "d MMMM yyyy")}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">วันที่สิ้นสุด</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {formatThaiDate(contract.endDate, "d MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">มูลค่ารวม</p>
              <p className="text-2xl font-bold">
                {formatPrice(contract.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ค่าเช่ารายเดือน</p>
              <p className="text-2xl font-bold">
                {formatPrice(contract.monthlyAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">เงินมัดจำ</p>
              <p className="text-2xl font-bold">
                {formatPrice(contract.depositAmount)}
              </p>
            </div>
          </div>

          {contract.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">หมายเหตุ</p>
                <p className="text-sm">{contract.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Equipment List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            รายการอุปกรณ์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>อุปกรณ์</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">จำนวน</TableHead>
                <TableHead className="text-right">ราคา/เดือน</TableHead>
                <TableHead className="text-right">รวม</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.equipment.name}
                  </TableCell>
                  <TableCell>{item.equipment.category.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.pricePerMonth)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                ตารางการชำระเงิน
              </CardTitle>
              <CardDescription>
                ชำระแล้ว {paidPayments.length} จาก {contract.payments.length} งวด
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">ความคืบหน้า</p>
              <p className="text-2xl font-bold">{paymentProgress.toFixed(0)}%</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>งวดที่</TableHead>
                <TableHead>กำหนดชำระ</TableHead>
                <TableHead>จำนวนเงิน</TableHead>
                <TableHead>วันที่ชำระ</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.payments.map((payment, index) => (
                <TableRow key={payment.id}>
                  <TableCell>งวดที่ {index + 1}</TableCell>
                  <TableCell>
                    {formatThaiDate(payment.dueDate, "d MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(payment.amount)}
                  </TableCell>
                  <TableCell>
                    {payment.paidAt
                      ? formatThaiDate(payment.paidAt, "d MMM yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "PAID"
                          ? "default"
                          : payment.status === "OVERDUE"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {payment.status === "PAID" && (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {payment.status === "PENDING" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {payment.status === "OVERDUE" && (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
