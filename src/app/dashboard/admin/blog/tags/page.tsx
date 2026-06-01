import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBlogTags } from "@/lib/blog/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagManager } from "@/components/blog-admin/tag-manager";

export const dynamic = "force-dynamic";

const BASE = "/dashboard/admin/blog";

export default async function AdminBlogTagsPage() {
  const tags = await getBlogTags();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={BASE}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">แท็กบทความ</h1>
          <p className="text-muted-foreground">เพิ่มหรือลบแท็ก</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>จัดการแท็ก</CardTitle>
        </CardHeader>
        <CardContent>
          <TagManager tags={tags} />
        </CardContent>
      </Card>
    </div>
  );
}
