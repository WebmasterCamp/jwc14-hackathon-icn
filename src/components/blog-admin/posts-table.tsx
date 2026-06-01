import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatThaiDate } from "@/lib/format";
import { PostActions } from "./post-actions";

type Status = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

const statusMeta: Record<Status, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PUBLISHED: { label: "เผยแพร่", variant: "default" },
  DRAFT: { label: "ฉบับร่าง", variant: "secondary" },
  SCHEDULED: { label: "ตั้งเวลา", variant: "outline" },
  ARCHIVED: { label: "เก็บถาวร", variant: "outline" },
};

export interface AdminPostRow {
  id: string;
  slug: string;
  title: string;
  titleTh?: string | null;
  status: Status;
  isFeatured: boolean;
  publishedAt?: Date | null;
  viewCount: number;
  categories: { category: { name: string; nameTh?: string | null } }[];
  _count?: { comments: number };
}

export function PostsTable({
  posts,
  basePath,
}: {
  posts: AdminPostRow[];
  basePath: string;
}) {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        ยังไม่มีบทความ
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ชื่อบทความ</TableHead>
          <TableHead>หมวดหมู่</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead className="text-right">เข้าชม</TableHead>
          <TableHead>เผยแพร่เมื่อ</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => {
          const meta = statusMeta[post.status];
          return (
            <TableRow key={post.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {post.isFeatured && (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-600">
                      แนะนำ
                    </Badge>
                  )}
                  <span className="font-medium">{post.titleTh || post.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {post.categories.map(({ category }, i) => (
                    <Badge key={i} variant="secondary">
                      {category.nameTh || category.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={meta.variant}>{meta.label}</Badge>
              </TableCell>
              <TableCell className="text-right">{post.viewCount}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {post.publishedAt ? formatThaiDate(post.publishedAt, "d MMM yyyy") : "-"}
              </TableCell>
              <TableCell>
                <PostActions
                  slug={post.slug}
                  basePath={basePath}
                  status={post.status}
                  isFeatured={post.isFeatured}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
