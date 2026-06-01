import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import {
  DollarSign,
  Package,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatThaiDate } from "@/lib/format";
import { calculateProviderRevenue } from "@/lib/analytics";

export default async function ProviderDashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      equipment: {
        where: { isActive: true },
      },
      contracts: {
        where: {
          status: { in: ["ACTIVE", "PENDING_APPROVAL"] },
        },
        include: {
          customer: true,
          payments: {
            where: { status: "OVERDUE" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!provider) redirect("/sign-in");

  // Calculate stats
  const totalEquipment = provider.equipment.length;
  const totalStock = provider.equipment.reduce((sum, eq) => sum + eq.stock, 0);
  const rentedStock = provider.equipment.reduce(
    (sum, eq) => sum + (eq.stock - eq.availableStock),
    0
  );
  const utilizationRate = totalStock > 0 ? (rentedStock / totalStock) * 100 : 0;
  const activeContracts = provider.contracts.filter(
    (c) => c.status === "ACTIVE"
  ).length;
  const pendingContracts = provider.contracts.filter(
    (c) => c.status === "PENDING_APPROVAL"
  ).length;
  const overduePayments = provider.contracts.reduce(
    (sum, c) => sum + c.payments.length,
    0
  );

  // Get real revenue data
  const revenueStats = await calculateProviderRevenue(provider.id, 12);
  const currentMonthRevenue = revenueStats.monthlyRevenue[revenueStats.monthlyRevenue.length - 1]?.revenue || 0;
  const revenueGrowth = revenueStats.growthRate;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          สวัสดี, {provider.companyName}
        </h1>
        <p className="text-muted-foreground">
          นี่คือภาพรวมธุรกิจของคุณวันนี้
        </p>
      </div>

      {/* Alerts */}
      {(overduePayments > 0 || pendingContracts > 0) && (
        <div className="flex flex-wrap gap-4">
          {overduePayments > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                มี {overduePayments} รายการค้างชำระ
              </span>
            </div>
          )}
          {pendingContracts > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">
                มี {pendingContracts} สัญญารอการอนุมัติ
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="รายได้เดือนนี้"
          value={formatPrice(currentMonthRevenue)}
          icon={DollarSign}
          trend={{
            value: Math.round(revenueGrowth),
            label: "จากเดือนที่แล้ว",
          }}
        />
        <StatCard
          title="อุปกรณ์ทั้งหมด"
          value={totalEquipment}
          description={`${totalStock} ชิ้นในสต็อก`}
          icon={Package}
        />
        <StatCard
          title="อัตราการใช้งาน"
          value={`${utilizationRate.toFixed(0)}%`}
          description={`${rentedStock}/${totalStock} ชิ้นถูกเช่า`}
          icon={TrendingUp}
        />
        <StatCard
          title="สัญญาที่ใช้งาน"
          value={activeContracts}
          description={
            pendingContracts > 0
              ? `+${pendingContracts} รอการอนุมัติ`
              : undefined
          }
          icon={FileText}
        />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <RevenueChart data={revenueStats.monthlyRevenue} />

        {/* Recent Contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>สัญญาล่าสุด</CardTitle>
              <CardDescription>สัญญาที่เพิ่งสร้างหรืออัพเดท</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/provider/contracts">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {provider.contracts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                ยังไม่มีสัญญา
              </p>
            ) : (
              <div className="space-y-4">
                {provider.contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {contract.customer.schoolName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contract.contractNumber} -{" "}
                        {formatThaiDate(contract.startDate, "d MMM yy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          contract.status === "ACTIVE"
                            ? "default"
                            : contract.status === "PENDING_APPROVAL"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {contract.status === "ACTIVE"
                          ? "ใช้งาน"
                          : contract.status === "PENDING_APPROVAL"
                          ? "รอการอนุมัติ"
                          : contract.status}
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/provider/equipment/new">
                <Package className="mr-2 h-4 w-4" />
                เพิ่มอุปกรณ์ใหม่
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/provider/contracts/new">
                <FileText className="mr-2 h-4 w-4" />
                สร้างสัญญาใหม่
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/provider/payments">
                <DollarSign className="mr-2 h-4 w-4" />
                ดูการชำระเงิน
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
