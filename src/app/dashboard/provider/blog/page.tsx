import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostsTable, type AdminPostRow } from "@/components/blog-admin/posts-table";

export const dynamic = "force-dynamic";

const BASE = "/dashboard/provider/blog";

export default async function ProviderBlogPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const provider = await prisma.provider.findUnique({
    where: { userId: session.user.id },
    select: { verified: true },
  });

  if (!provider?.verified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">บทความ</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ShieldAlert className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">บัญชียังไม่ได้รับการยืนยัน</p>
            <p className="max-w-md text-sm text-muted-foreground">
              เฉพาะผู้ให้บริการที่ได้รับการยืนยันแล้วเท่านั้นจึงจะเขียนบทความได้
              กรุณารอการอนุมัติจากผู้ดูแลระบบ
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const posts = await prisma.blogPost.findMany({
    where: { authorId: session.user.id },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บทความของฉัน</h1>
          <p className="text-muted-foreground">จัดการบทความที่คุณเขียน</p>
        </div>
        <Button asChild>
          <Link href={`${BASE}/new`}>
            <Plus className="mr-2 h-4 w-4" />
            เขียนบทความ
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PostsTable posts={posts as unknown as AdminPostRow[]} basePath={BASE} />
        </CardContent>
      </Card>
    </div>
  );
}
