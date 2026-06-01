import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceRequestForm } from "@/components/customer/maintenance-request-form";
import { ensureCustomerProfile } from "@/lib/queries";

export default async function NewMaintenanceRequestPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "USER") return null;

  // Guarantee the profile row exists so we never redirect-loop with middleware.
  await ensureCustomerProfile(session.user.id, session.user.name);

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) return null;

  // Get equipment from active contracts with contract details
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
              provider: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Flatten equipment with contract info
  const equipment = activeContracts.flatMap((contract) =>
    contract.items.map((item) => ({
      ...item.equipment,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      quantity: item.quantity,
    }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account/maintenance">
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
              <p className="text-muted-foreground mb-2">
                คุณยังไม่มีสัญญาที่ใช้งานอยู่
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                กรุณาเช่าอุปกรณ์ก่อนเพื่อสร้างคำขอซ่อมบำรุง
              </p>
              <Button asChild>
                <Link href="/equipment">เรียกดูอุปกรณ์</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Show active contracts summary */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="font-medium mb-3">อุปกรณ์ที่เช่าอยู่</h3>
                <div className="space-y-2">
                  {equipment.map((eq) => (
                    <div key={eq.id} className="flex items-start gap-3 text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{eq.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {eq.category.nameTh} • {eq.provider.companyName} • จำนวน {eq.quantity} ชิ้น
                        </p>
                        <p className="text-muted-foreground text-xs">
                          สัญญา: {eq.contractNumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <MaintenanceRequestForm equipment={equipment} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
