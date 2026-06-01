import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBlogCategories } from "@/lib/blog/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryManager } from "@/components/blog-admin/category-manager";

export const dynamic = "force-dynamic";

const BASE = "/dashboard/admin/blog";

export default async function AdminBlogCategoriesPage() {
  const categories = await getBlogCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={BASE}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">หมวดหมู่บทความ</h1>
          <p className="text-muted-foreground">เพิ่มหรือลบหมวดหมู่</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>จัดการหมวดหมู่</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryManager categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
