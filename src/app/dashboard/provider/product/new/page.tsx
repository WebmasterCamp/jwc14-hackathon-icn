import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentForm } from "@/components/provider/equipment-form";

export default async function NewEquipmentPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    redirect("/login");
  }

  if (!provider.verified) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/provider/product">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">เพิ่มอุปกรณ์ใหม่</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ไม่สามารถเพิ่มอุปกรณ์ได้</CardTitle>
            <CardDescription>
              บัญชีของคุณยังไม่ได้รับการยืนยัน กรุณารอการอนุมัติจากผู้ดูแลระบบ
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/provider/product">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">เพิ่มอุปกรณ์ใหม่</h1>
          <p className="text-muted-foreground">
            เพิ่มอุปกรณ์ของคุณเข้าสู่ระบบ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลอุปกรณ์</CardTitle>
          <CardDescription>
            กรอกข้อมูลอุปกรณ์ที่ต้องการให้เช่า
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EquipmentForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
