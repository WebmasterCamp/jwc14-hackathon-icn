import Link from "next/link";
import { Plus, MessageSquare, FolderTree, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostsTable, type AdminPostRow } from "@/components/blog-admin/posts-table";

export const dynamic = "force-dynamic";

const BASE = "/dashboard/admin/blog";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    include: {
      author: { select: { name: true } },
      categories: { include: { category: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows = posts as unknown as AdminPostRow[];
  const byStatus = (s: string) => rows.filter((p) => p.status === s);

  const tabs = [
    { key: "all", label: `ทั้งหมด (${rows.length})`, rows },
    { key: "PUBLISHED", label: "เผยแพร่", rows: byStatus("PUBLISHED") },
    { key: "DRAFT", label: "ฉบับร่าง", rows: byStatus("DRAFT") },
    { key: "SCHEDULED", label: "ตั้งเวลา", rows: byStatus("SCHEDULED") },
    { key: "ARCHIVED", label: "เก็บถาวร", rows: byStatus("ARCHIVED") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บทความ</h1>
          <p className="text-muted-foreground">จัดการบทความทั้งหมดในระบบ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`${BASE}/comments`}>
              <MessageSquare className="mr-2 h-4 w-4" />
              ความคิดเห็น
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`${BASE}/categories`}>
              <FolderTree className="mr-2 h-4 w-4" />
              หมวดหมู่
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`${BASE}/tags`}>
              <Tag className="mr-2 h-4 w-4" />
              แท็ก
            </Link>
          </Button>
          <Button asChild>
            <Link href={`${BASE}/new`}>
              <Plus className="mr-2 h-4 w-4" />
              เขียนบทความ
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all">
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((t) => (
              <TabsContent key={t.key} value={t.key} className="mt-4">
                <PostsTable posts={t.rows} basePath={BASE} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
