import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentForm } from "@/components/provider/equipment-form";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/sign-in");
  }

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    redirect("/sign-in");
  }

  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) {
    notFound();
  }

  // Check ownership
  if (equipment.providerId !== provider.id) {
    redirect("/dashboard/provider/equipment");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/provider/equipment">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">แก้ไขอุปกรณ์</h1>
          <p className="text-muted-foreground">{equipment.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลอุปกรณ์</CardTitle>
          <CardDescription>
            แก้ไขข้อมูลอุปกรณ์ของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EquipmentForm
            categories={categories}
            initialData={{
              id: equipment.id,
              categoryId: equipment.categoryId,
              name: equipment.name,
              nameTh: equipment.nameTh || undefined,
              description: equipment.description || undefined,
              descriptionTh: equipment.descriptionTh || undefined,
              rentPriceMonthly: equipment.rentPriceMonthly,
              leaseToOwnPrice: equipment.leaseToOwnPrice || undefined,
              leaseDuration: equipment.leaseDuration || undefined,
              depositAmount: equipment.depositAmount,
              stock: equipment.stock,
              condition: equipment.condition,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
