import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function ProviderSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, phone: true, email: true } } },
  });
  if (!provider) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่า</h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลบริษัทและบัญชีของคุณ
        </p>
      </div>

      {/* Verification status (read-only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>สถานะการยืนยัน</CardTitle>
              <CardDescription>{provider.user.email}</CardDescription>
            </div>
            <Badge variant={provider.verified ? "default" : "secondary"}>
              {provider.verified ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  ยืนยันแล้ว
                </>
              ) : (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  รอการยืนยัน
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลบริษัท</CardTitle>
          <CardDescription>
            ข้อมูลนี้จะแสดงต่อสถานศึกษาที่สนใจเช่าอุปกรณ์
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            variant="provider"
            initialData={{
              name: provider.user.name,
              phone: provider.user.phone,
              companyName: provider.companyName,
              taxId: provider.taxId,
              address: provider.address,
              province: provider.province,
              bankName: provider.bankName,
              bankAccount: provider.bankAccount,
              description: provider.description,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
