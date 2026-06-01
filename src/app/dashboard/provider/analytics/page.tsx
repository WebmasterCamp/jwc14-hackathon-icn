import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { DollarSign, TrendingUp, FileText, Package } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import {
  Card,
  CardContent,
  CardDescription,
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
import { formatPrice } from "@/lib/format";
import { calculateProviderRevenue } from "@/lib/analytics";

export default async function ProviderAnalyticsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: { equipment: { where: { isActive: true } } },
  });
  if (!provider) redirect("/login");

  const [revenueStats, activeContractCount, activeItems] = await Promise.all([
    calculateProviderRevenue(provider.id, 12),
    prisma.contract.count({
      where: { providerId: provider.id, status: "ACTIVE" },
    }),
    prisma.contractItem.findMany({
      where: {
        contract: { providerId: provider.id, status: "ACTIVE" },
      },
      include: { equipment: { select: { id: true, name: true, nameTh: true } } },
    }),
  ]);

  // Utilization across all active equipment stock
  const totalStock = provider.equipment.reduce((sum, eq) => sum + eq.stock, 0);
  const rentedStock = provider.equipment.reduce(
    (sum, eq) => sum + (eq.stock - eq.availableStock),
    0
  );
  const utilizationRate = totalStock > 0 ? (rentedStock / totalStock) * 100 : 0;

  // Per-equipment performance from active contract items
  const perfMap = new Map<
    string,
    { name: string; quantity: number; monthlyRevenue: number }
  >();
  for (const item of activeItems) {
    const key = item.equipment.id;
    const existing = perfMap.get(key) ?? {
      name: item.equipment.nameTh || item.equipment.name,
      quantity: 0,
      monthlyRevenue: 0,
    };
    existing.quantity += item.quantity;
    existing.monthlyRevenue += item.subtotal;
    perfMap.set(key, existing);
  }
  const performance = Array.from(perfMap.values()).sort(
    (a, b) => b.monthlyRevenue - a.monthlyRevenue
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">วิเคราะห์ธุรกิจ</h1>
        <p className="text-muted-foreground">
          ภาพรวมรายได้และผลการดำเนินงานย้อนหลัง 12 เดือน
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="รายได้รวม (12 เดือน)"
          value={formatPrice(revenueStats.totalRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="การเติบโต"
          value={`${revenueStats.growthRate >= 0 ? "+" : ""}${Math.round(
            revenueStats.growthRate
          )}%`}
          description="เทียบกับเดือนที่แล้ว"
          icon={TrendingUp}
        />
        <StatCard
          title="อัตราการใช้งาน"
          value={`${utilizationRate.toFixed(0)}%`}
          description={`${rentedStock}/${totalStock} ชิ้นถูกเช่า`}
          icon={Package}
        />
        <StatCard
          title="สัญญาที่ใช้งาน"
          value={activeContractCount}
          icon={FileText}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={revenueStats.monthlyRevenue} />

      {/* Equipment Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            ผลการดำเนินงานของอุปกรณ์
          </CardTitle>
          <CardDescription>
            อุปกรณ์ที่อยู่ในสัญญาที่ใช้งาน เรียงตามรายได้ต่อเดือน
          </CardDescription>
        </CardHeader>
        <CardContent>
          {performance.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                ยังไม่มีอุปกรณ์ในสัญญาที่ใช้งาน
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>อุปกรณ์</TableHead>
                  <TableHead className="text-right">จำนวนที่ถูกเช่า</TableHead>
                  <TableHead className="text-right">รายได้/เดือน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right">
                      {row.quantity} ชิ้น
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(row.monthlyRevenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
