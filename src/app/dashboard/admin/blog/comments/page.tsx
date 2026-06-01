import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatThaiDate } from "@/lib/format";
import { CommentActions } from "@/components/blog-admin/comment-actions";

export const dynamic = "force-dynamic";

const BASE = "/dashboard/admin/blog";

export default async function AdminBlogCommentsPage() {
  const comments = await prisma.blogComment.findMany({
    where: { isApproved: false },
    include: {
      post: { select: { title: true, titleTh: true, slug: true } },
      author: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={BASE}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">ความคิดเห็นรออนุมัติ</h1>
          <p className="text-muted-foreground">
            {comments.length} ความคิดเห็นรอการตรวจสอบ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการ</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              ไม่มีความคิดเห็นที่รออนุมัติ
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้เขียน</TableHead>
                  <TableHead>ความคิดเห็น</TableHead>
                  <TableHead>บทความ</TableHead>
                  <TableHead>วันที่</TableHead>
                  <TableHead className="w-[200px] text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="align-top">
                      <p className="font-medium">{comment.author.name || "ผู้ใช้"}</p>
                      <p className="text-xs text-muted-foreground">{comment.author.email}</p>
                    </TableCell>
                    <TableCell className="max-w-sm align-top">
                      <p className="whitespace-pre-wrap text-sm">{comment.content}</p>
                    </TableCell>
                    <TableCell className="align-top">
                      <Link
                        href={`/blog/${comment.post.slug}`}
                        target="_blank"
                        className="text-sm text-primary hover:underline"
                      >
                        {comment.post.titleTh || comment.post.title}
                      </Link>
                    </TableCell>
                    <TableCell className="align-top text-sm text-muted-foreground">
                      {formatThaiDate(comment.createdAt, "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="align-top">
                      <CommentActions commentId={comment.id} />
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
