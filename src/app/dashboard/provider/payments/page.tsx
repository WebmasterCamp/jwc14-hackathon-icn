import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
import { CreditCard, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }
> = {
  PENDING: { label: "รอชำระ", variant: "secondary", icon: Clock },
  PAID: { label: "ชำระแล้ว", variant: "default", icon: CheckCircle2 },
  OVERDUE: { label: "เกินกำหนด", variant: "destructive", icon: AlertTriangle },
  FAILED: { label: "ล้มเหลว", variant: "destructive", icon: AlertTriangle },
};

export default async function ProviderPaymentsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      contracts: {
        include: {
          customer: true,
          payments: {
            orderBy: { dueDate: "desc" },
          },
        },
      },
    },
  });

  if (!provider) redirect("/sign-in");

  // Flatten payments
  const allPayments = provider.contracts.flatMap((contract) =>
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

  const PaymentTable = ({ payments }: { payments: typeof allPayments }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>สถานศึกษา</TableHead>
          <TableHead>เลขที่สัญญา</TableHead>
          <TableHead>จำนวนเงิน</TableHead>
          <TableHead>กำหนดชำระ</TableHead>
          <TableHead>วันที่ชำระ</TableHead>
          <TableHead>สถานะ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const config = statusConfig[payment.status];
          const StatusIcon = config.icon;
          return (
            <TableRow key={payment.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {payment.contract.customer.schoolName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.contract.customer.province}
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
                {formatThaiDate(payment.dueDate, "d MMM yy")}
              </TableCell>
              <TableCell>
                {payment.paidAt
                  ? formatThaiDate(payment.paidAt, "d MMM yy")
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={config.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </TableCell>
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
          ติดตามการชำระเงินจากลูกค้า
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
          description={`${
            paidPayments.filter((p) => {
              if (!p.paidAt) return false;
              const now = new Date();
              return (
                p.paidAt.getMonth() === now.getMonth() &&
                p.paidAt.getFullYear() === now.getFullYear()
              );
            }).length
          } รายการ`}
          icon={CheckCircle2}
        />
      </div>

      {/* Payments Table */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            รอชำระ ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            เกินกำหนด ({overduePayments.length})
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
                รายการที่ยังไม่ถึงกำหนดชำระ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">ไม่มีรายการรอชำระ</p>
                </div>
              ) : (
                <PaymentTable payments={pendingPayments} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">
                รายการเกินกำหนดชำระ
              </CardTitle>
              <CardDescription>
                รายการที่เลยกำหนดชำระแล้ว
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overduePayments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    ไม่มีรายการเกินกำหนดชำระ
                  </p>
                </div>
              ) : (
                <PaymentTable payments={overduePayments} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>รายการชำระแล้ว</CardTitle>
              <CardDescription>ประวัติการชำระเงิน</CardDescription>
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
