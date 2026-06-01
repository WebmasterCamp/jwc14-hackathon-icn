import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBlogCategories, getBlogTags } from "@/lib/blog/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostForm } from "@/components/blog-admin/post-form";

export const dynamic = "force-dynamic";

const BASE = "/dashboard/admin/blog";

export default async function AdminNewBlogPostPage() {
  const [categories, tags] = await Promise.all([getBlogCategories(), getBlogTags()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={BASE}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">เขียนบทความใหม่</h1>
          <p className="text-muted-foreground">สร้างบทความสำหรับเว็บไซต์</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลบทความ</CardTitle>
        </CardHeader>
        <CardContent>
          <PostForm mode="create" basePath={BASE} categories={categories} tags={tags} />
        </CardContent>
      </Card>
    </div>
  );
}
