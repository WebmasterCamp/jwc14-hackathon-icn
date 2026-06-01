import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceRequestForm } from "@/components/customer/maintenance-request-form";
import { ensureCustomerProfile } from "@/lib/queries";

export default async function NewMaintenanceRequestPage() {
  const session = await auth();
  if (!session || session.user.role !== "CUSTOMER") {
    redirect("/sign-in");
  }

  // Guarantee the profile row exists so we never redirect-loop with middleware.
  await ensureCustomerProfile(session.user.id, session.user.name);

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) {
    redirect("/sign-in");
  }

  // Get equipment from active contracts
  const activeContracts = await prisma.contract.findMany({
    where: {
      customerId: customer.id,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: {
          equipment: {
            include: {
              category: true,
              provider: true,
            },
          },
        },
      },
    },
  });

  const equipment = activeContracts.flatMap((contract) =>
    contract.items.map((item) => item.equipment)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/customer/maintenance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">สร้างคำขอซ่อมบำรุง</h1>
          <p className="text-muted-foreground">
            แจ้งปัญหาหรือขอซ่อมบำรุงอุปกรณ์
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดคำขอ</CardTitle>
          <CardDescription>
            กรอกข้อมูลปัญหาหรือการซ่อมบำรุงที่ต้องการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                คุณยังไม่มีสัญญาที่ใช้งานอยู่
              </p>
              <Button asChild>
                <Link href="/equipment">เรียกดูอุปกรณ์</Link>
              </Button>
            </div>
          ) : (
            <MaintenanceRequestForm equipment={equipment} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
