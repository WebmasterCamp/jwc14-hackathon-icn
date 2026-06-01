import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
import { CreditCard, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PayButton } from "@/components/payments/pay-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatPrice, formatThaiDate } from "@/lib/format";
import { ensureCustomerProfile } from "@/lib/queries";
import { differenceInDays } from "date-fns";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: typeof CheckCircle2;
  }
> = {
  PENDING: { label: "รอชำระ", variant: "secondary", icon: Clock },
  PAID: { label: "ชำระแล้ว", variant: "default", icon: CheckCircle2 },
  OVERDUE: { label: "เกินกำหนด", variant: "destructive", icon: AlertTriangle },
  FAILED: { label: "ล้มเหลว", variant: "destructive", icon: AlertTriangle },
};

export default async function CustomerPaymentsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  // Guarantee the profile row exists so we never redirect-loop with middleware.
  await ensureCustomerProfile(session.user.id, session.user.name);

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      contracts: {
        include: {
          provider: true,
          payments: {
            orderBy: { dueDate: "asc" },
          },
        },
      },
    },
  });

  if (!customer) redirect("/sign-in");

  // Flatten payments
  const allPayments = customer.contracts.flatMap((contract) =>
    contract.payments.map((payment) => ({
      ...payment,
      contract,
    }))
  );

  const pendingPayments = allPayments.filter((p) => p.status === "PENDING");
  const overduePayments = allPayments.filter((p) => p.status === "OVERDUE");
  const paidPayments = allPayments.filter((p) => p.status === "PAID");

  // Calculate stats
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaidThisMonth = paidPayments
    .filter((p) => {
      if (!p.paidAt) return false;
      const now = new Date();
      return (
        p.paidAt.getMonth() === now.getMonth() &&
        p.paidAt.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const PaymentTable = ({
    payments,
    showPayButton = false,
  }: {
    payments: typeof allPayments;
    showPayButton?: boolean;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ผู้ให้บริการ</TableHead>
          <TableHead>เลขที่สัญญา</TableHead>
          <TableHead>จำนวนเงิน</TableHead>
          <TableHead>กำหนดชำระ</TableHead>
          <TableHead>สถานะ</TableHead>
          {showPayButton && <TableHead className="w-[100px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const config = statusConfig[payment.status];
          const StatusIcon = config.icon;
          const daysUntilDue = differenceInDays(
            new Date(payment.dueDate),
            new Date()
          );
          return (
            <TableRow key={payment.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {payment.contract.provider.companyName}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-mono">
                {payment.contract.contractNumber}
              </TableCell>
              <TableCell className="font-medium">
                {formatPrice(payment.amount)}
              </TableCell>
              <TableCell>
                <div>
                  <p>{formatThaiDate(payment.dueDate, "d MMM yy")}</p>
                  {payment.status === "PENDING" && (
                    <p
                      className={`text-sm ${
                        daysUntilDue <= 7
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {daysUntilDue > 0
                        ? `อีก ${daysUntilDue} วัน`
                        : daysUntilDue === 0
                        ? "วันนี้"
                        : `เลย ${Math.abs(daysUntilDue)} วัน`}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={config.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </TableCell>
              {showPayButton && (
                <TableCell>
                  <PayButton
                    paymentId={payment.id}
                    amount={payment.amount}
                    contractNumber={payment.contract.contractNumber}
                  />
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">การชำระเงิน</h1>
        <p className="text-muted-foreground">
          จัดการการชำระค่าเช่าอุปกรณ์
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="รอชำระเงิน"
          value={formatPrice(totalPending)}
          description={`${pendingPayments.length} รายการ`}
          icon={Clock}
        />
        <StatCard
          title="เกินกำหนดชำระ"
          value={formatPrice(totalOverdue)}
          description={`${overduePayments.length} รายการ`}
          icon={AlertTriangle}
          className={totalOverdue > 0 ? "border-destructive" : ""}
        />
        <StatCard
          title="ชำระแล้วเดือนนี้"
          value={formatPrice(totalPaidThisMonth)}
          icon={CheckCircle2}
        />
      </div>

      {/* Overdue Alert */}
      {overduePayments.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              มีรายการเกินกำหนดชำระ
            </CardTitle>
            <CardDescription>
              กรุณาชำระเงินโดยเร็วเพื่อหลีกเลี่ยงการระงับบริการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentTable payments={overduePayments} showPayButton />
          </CardContent>
        </Card>
      )}

      {/* Payments Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            รอชำระ ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            ชำระแล้ว ({paidPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>รายการรอชำระ</CardTitle>
              <CardDescription>
                รายการที่ต้องชำระในเร็วๆ นี้
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">ไม่มีรายการรอชำระ</p>
                </div>
              ) : (
                <PaymentTable payments={pendingPayments} showPayButton />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการชำระเงิน</CardTitle>
              <CardDescription>รายการที่ชำระแล้ว</CardDescription>
            </CardHeader>
            <CardContent>
              {paidPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">ยังไม่มีประวัติการชำระ</p>
                </div>
              ) : (
                <PaymentTable payments={paidPayments} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
