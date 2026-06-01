import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Users, Building2, GraduationCap, Package, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

  const [user, userCount, providerCount, customerCount, equipmentCount, contractCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, phone: true, email: true },
      }),
      prisma.user.count(),
      prisma.provider.count(),
      prisma.customer.count(),
      prisma.equipment.count(),
      prisma.contract.count(),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground">
          ภาพรวมแพลตฟอร์มและข้อมูลบัญชีผู้ดูแล
        </p>
      </div>

      {/* Platform overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title="ผู้ใช้ทั้งหมด" value={userCount} icon={Users} />
        <StatCard title="ผู้ให้บริการ" value={providerCount} icon={Building2} />
        <StatCard title="สถานศึกษา" value={customerCount} icon={GraduationCap} />
        <StatCard title="อุปกรณ์" value={equipmentCount} icon={Package} />
        <StatCard title="สัญญา" value={contractCount} icon={FileText} />
      </div>

      {/* Admin account */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลบัญชีผู้ดูแล</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            variant="admin"
            initialData={{ name: user?.name, phone: user?.phone }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
