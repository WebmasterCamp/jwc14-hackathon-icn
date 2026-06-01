import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeaturedProductsManager } from "@/components/admin/featured-products-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      nameTh: true,
      images: true,
      isFeatured: true,
      category: { select: { nameTh: true, name: true } },
      _count: { select: { equipment: true } },
    },
  });

  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">สินค้าแนะนำ</h1>
          <p className="text-muted-foreground">
            เลือกสินค้าที่จะแสดงในส่วน “รายการสินค้าแนะนำ” บนหน้าแรก
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เลือกสินค้าแนะนำ ({featuredCount} รายการ)</CardTitle>
        </CardHeader>
        <CardContent>
          <FeaturedProductsManager products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
