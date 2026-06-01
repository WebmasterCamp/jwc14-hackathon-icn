import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import {
  Users,
  Building2,
  GraduationCap,
  FileText,
  DollarSign,
  Package,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatThaiDate } from "@/lib/format";
import { calculateAdminRevenue } from "@/lib/analytics";

export default async function AdminDashboardPage() {
  // Get platform stats
  const [
    totalUsers,
    totalProviders,
    totalCustomers,
    totalEquipment,
    activeContracts,
    pendingProviders,
    recentProviders,
    recentCustomers,
    revenueStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count(),
    prisma.customer.count(),
    prisma.equipment.count({ where: { isActive: true } }),
    prisma.contract.count({ where: { status: "ACTIVE" } }),
    prisma.provider.count({ where: { verified: false } }),
    prisma.provider.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
    prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
    calculateAdminRevenue(12),
  ]);

  const totalRevenue = revenueStats.totalRevenue;
  const revenueGrowth = revenueStats.growthRate;
  const currentMonthRevenue = revenueStats.monthlyRevenue[revenueStats.monthlyRevenue.length - 1]?.revenue || 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="text-muted-foreground">
          ภาพรวมแพลตฟอร์ม Sparkgo
        </p>
      </div>

      {/* Alerts */}
      {pendingProviders > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-lg w-fit">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            มี {pendingProviders} ผู้ให้บริการรอการยืนยัน
          </span>
          <Link
            href="/dashboard/admin/providers?filter=pending"
            className="text-sm underline"
          >
            ตรวจสอบ
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="รายได้รวม"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          trend={{
            value: Math.round(revenueGrowth),
            label: "จากเดือนที่แล้ว",
          }}
        />
        <StatCard
          title="ผู้ใช้ทั้งหมด"
          value={totalUsers}
          icon={Users}
        />
        <StatCard
          title="ผู้ให้บริการ"
          value={totalProviders}
          description={
            pendingProviders > 0
              ? `${pendingProviders} รอการยืนยัน`
              : undefined
          }
          icon={Building2}
        />
        <StatCard
          title="สถานศึกษา"
          value={totalCustomers}
          icon={GraduationCap}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="อุปกรณ์ในระบบ"
          value={totalEquipment}
          icon={Package}
        />
        <StatCard
          title="สัญญาที่ใช้งาน"
          value={activeContracts}
          icon={FileText}
        />
        <StatCard
          title="อัตราการเติบโต"
          value={`${revenueGrowth.toFixed(0)}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="รายได้เดือนนี้"
          value={formatPrice(currentMonthRevenue)}
          icon={DollarSign}
        />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <RevenueChart data={revenueStats.monthlyRevenue} />

        {/* Recent Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ผู้ให้บริการล่าสุด</CardTitle>
              <CardDescription>ผู้ให้บริการที่ลงทะเบียนใหม่</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/admin/providers">
                ดูทั้งหมด
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{provider.companyName}</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.user.email}
                    </p>
                  </div>
                  <Badge
                    variant={provider.verified ? "default" : "secondary"}
                  >
                    {provider.verified ? "ยืนยันแล้ว" : "รอยืนยัน"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>สถานศึกษาล่าสุด</CardTitle>
            <CardDescription>สถานศึกษาที่ลงทะเบียนใหม่</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/customers">
              ดูทั้งหมด
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{customer.schoolName}</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.province}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatThaiDate(customer.createdAt, "d MMM yy")}
                  </p>
                </div>
                <Badge variant="outline">{customer.schoolType}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
