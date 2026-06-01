import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ensureCustomerProfile } from "@/lib/queries";

export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function CustomerSettingsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const customer = await ensureCustomerProfile(
    session.user.id,
    session.user.name
  );
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่า</h1>
        <p className="text-muted-foreground">
          จัดการข้อมูลสถานศึกษาและบัญชีของคุณ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลสถานศึกษา</CardTitle>
          <CardDescription>
            ข้อมูลนี้ช่วยให้ผู้ให้บริการเสนอราคาได้แม่นยำขึ้น
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            variant="customer"
            initialData={{
              name: user?.name,
              phone: user?.phone,
              schoolName: customer.schoolName,
              schoolType: customer.schoolType,
              address: customer.address,
              province: customer.province,
              studentCount: customer.studentCount,
              budget: customer.budget,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
