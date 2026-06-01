import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import {
  FileText,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowRight,
  Search,
  Calendar,
} from "lucide-react";
import { ensureCustomerProfile } from "@/lib/queries";
import { StatCard } from "@/components/dashboard/stat-card";
import { MembershipCard } from "@/components/account/membership-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatThaiDate } from "@/lib/format";
import { differenceInDays } from "date-fns";

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  // Guarantee the profile row exists so we never redirect-loop with middleware.
  await ensureCustomerProfile(session.user.id, session.user.name);

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      contracts: {
        where: { status: { in: ["ACTIVE", "PENDING_APPROVAL"] } },
        include: {
          provider: true,
          items: {
            include: {
              equipment: true,
            },
          },
          payments: {
            where: {
              status: { in: ["PENDING", "OVERDUE"] },
            },
            orderBy: { dueDate: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      maintenance: {
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!customer) return null;

  // Total settled spend across all of this customer's contracts — drives the
  // membership tier (see @/lib/tier).
  const paidAgg = await prisma.payment.aggregate({
    where: { status: "PAID", contract: { customerId: customer.id } },
    _sum: { amount: true },
  });
  const totalPaid = paidAgg._sum.amount ?? 0;

  // Calculate stats
  const activeContracts = customer.contracts.filter(
    (c) => c.status === "ACTIVE"
  ).length;
  const totalEquipment = customer.contracts
    .filter((c) => c.status === "ACTIVE")
    .reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0);

  const upcomingPayments = customer.contracts.flatMap((c) => c.payments);
  const overduePayments = upcomingPayments.filter(
    (p) => p.status === "OVERDUE"
  );
  const nextPayment = upcomingPayments.find((p) => p.status === "PENDING");
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          สวัสดี, {customer.schoolName}
        </h1>
        <p className="text-muted-foreground">
          นี่คือภาพรวมการเช่าอุปกรณ์ของคุณ
        </p>
      </div>

      {/* Alerts */}
      {(overduePayments.length > 0 || nextPayment) && (
        <div className="flex flex-wrap gap-4">
          {overduePayments.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                มี {overduePayments.length} รายการค้างชำระ (
                {formatPrice(totalOverdue)})
              </span>
              <Link
                href="/account/payments"
                className="text-sm underline"
              >
                ชำระเงิน
              </Link>
            </div>
          )}
          {nextPayment && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                ชำระเงินครั้งถัดไป{" "}
                {formatPrice(nextPayment.amount)} ภายใน{" "}
                {differenceInDays(new Date(nextPayment.dueDate), new Date())}{" "}
                วัน
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="สัญญาที่ใช้งาน"
          value={activeContracts}
          icon={FileText}
        />
        <StatCard
          title="อุปกรณ์ที่เช่า"
          value={totalEquipment}
          description="ชิ้น"
          icon={Package}
        />
        <StatCard
          title="รายการรอชำระ"
          value={upcomingPayments.length}
          description={
            nextPayment
              ? `ครั้งถัดไป ${formatThaiDate(nextPayment.dueDate, "d MMM")}`
              : undefined
          }
          icon={CreditCard}
        />
        <StatCard
          title="ค้างชำระ"
          value={formatPrice(totalOverdue)}
          description={
            overduePayments.length > 0
              ? `${overduePayments.length} รายการ`
              : "ไม่มี"
          }
          icon={AlertTriangle}
          className={totalOverdue > 0 ? "border-destructive" : ""}
        />
      </div>

      {/* Membership tier */}
      <MembershipCard totalPaid={totalPaid} />

      {/* Active Contracts & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>สัญญาที่ใช้งาน</CardTitle>
              <CardDescription>
                อุปกรณ์ที่คุณกำลังเช่าอยู่
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/contracts">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {customer.contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  ยังไม่มีสัญญาที่ใช้งาน
                </p>
                <Button asChild>
                  <Link href="/product">
                    <Search className="mr-2 h-4 w-4" />
                    ค้นหาอุปกรณ์
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {customer.contracts.slice(0, 3).map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {contract.provider.companyName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.items.length} รายการ -{" "}
                        {formatThaiDate(contract.endDate, "d MMM yy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          contract.status === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {contract.status === "ACTIVE"
                          ? "ใช้งาน"
                          : "รอการอนุมัติ"}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(contract.monthlyAmount)}/เดือน
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>การชำระเงินที่กำลังจะถึง</CardTitle>
              <CardDescription>
                รายการที่ต้องชำระในเร็วๆ นี้
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/account/payments">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  ไม่มีรายการรอชำระ
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingPayments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {formatPrice(payment.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        กำหนดชำระ{" "}
                        {formatThaiDate(payment.dueDate, "d MMM yy")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        payment.status === "OVERDUE"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {payment.status === "OVERDUE"
                        ? "เกินกำหนด"
                        : "รอชำระ"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/product">
                <Search className="mr-2 h-4 w-4" />
                ค้นหาอุปกรณ์
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account/payments">
                <CreditCard className="mr-2 h-4 w-4" />
                ชำระเงิน
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/account/maintenance">
                <Package className="mr-2 h-4 w-4" />
                แจ้งซ่อม
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
