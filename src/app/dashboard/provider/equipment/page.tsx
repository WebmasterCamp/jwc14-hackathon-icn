import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentActions } from "@/components/provider/equipment-actions";
import { formatPrice } from "@/lib/format";

const conditionLabels: Record<string, string> = {
  NEW: "ใหม่",
  EXCELLENT: "ดีเยี่ยม",
  GOOD: "ดี",
  FAIR: "พอใช้",
};

export default async function ProviderEquipmentPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    include: {
      equipment: {
        include: {
          category: true,
          product: { select: { slug: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!provider) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">อุปกรณ์ของฉัน</h1>
          <p className="text-muted-foreground">
            จัดการอุปกรณ์ที่คุณให้บริการเช่า
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/provider/equipment/new">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มอุปกรณ์
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการอุปกรณ์</CardTitle>
          <CardDescription>
            ทั้งหมด {provider.equipment.length} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {provider.equipment.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">ยังไม่มีอุปกรณ์</p>
              <Button asChild>
                <Link href="/dashboard/provider/equipment/new">
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มอุปกรณ์แรก
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>อุปกรณ์</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>ราคาเช่า/เดือน</TableHead>
                  <TableHead>สต็อก</TableHead>
                  <TableHead>สภาพ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {provider.equipment.map((equipment) => (
                  <TableRow key={equipment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={equipment.images[0]}
                            alt={equipment.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {equipment.nameTh || equipment.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {equipment.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {equipment.category.nameTh}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(equipment.rentPriceMonthly)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          equipment.availableStock === 0
                            ? "text-destructive"
                            : equipment.availableStock <= 3
                            ? "text-yellow-600"
                            : ""
                        }
                      >
                        {equipment.availableStock}/{equipment.stock}
                      </span>
                    </TableCell>
                    <TableCell>{conditionLabels[equipment.condition]}</TableCell>
                    <TableCell>
                      <Badge
                        variant={equipment.isActive ? "default" : "secondary"}
                      >
                        {equipment.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <EquipmentActions
                        equipmentId={equipment.id}
                        equipmentName={equipment.nameTh || equipment.name}
                        productSlug={equipment.product.slug}
                      />
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
