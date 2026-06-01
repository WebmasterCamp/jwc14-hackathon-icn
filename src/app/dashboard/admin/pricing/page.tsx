import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductPricingManager } from "@/components/admin/product-pricing-manager";

export default async function AdminPricingPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      nameTh: true,
      category: { select: { nameTh: true, name: true } },
      priceTiers: {
        orderBy: { minMonths: "asc" },
        select: {
          id: true,
          minMonths: true,
          maxMonths: true,
          discountPercent: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ราคาส่วนลดตามระยะเวลาเช่า</h1>
        <p className="text-muted-foreground">
          ตั้งส่วนลดต่อสินค้า — ยิ่งเช่านานยิ่งได้ราคาต่อเดือนถูกลง
          (ใช้กับเครื่องคำนวณ ใบเสนอราคา และสัญญา)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สินค้า ({products.length} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductPricingManager products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
