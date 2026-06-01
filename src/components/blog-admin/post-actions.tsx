"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Status = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";

const statusLabels: Record<Status, string> = {
  DRAFT: "ฉบับร่าง",
  SCHEDULED: "ตั้งเวลา",
  PUBLISHED: "เผยแพร่",
  ARCHIVED: "เก็บถาวร",
};

export function PostActions({
  slug,
  basePath,
  status,
  isFeatured,
}: {
  slug: string;
  basePath: string;
  status: Status;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function patch(body: Record<string, unknown>, successMsg: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/posts/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ไม่สำเร็จ");
      }
      toast.success(successMsg);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/posts/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ลบไม่สำเร็จ");
      }
      toast.success("ลบบทความแล้ว");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
      setShowDelete(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`${basePath}/${slug}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไข
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/blog/${slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              ดูหน้าเว็บ
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              patch(
                { isFeatured: !isFeatured },
                isFeatured ? "ยกเลิกบทความแนะนำแล้ว" : "ตั้งเป็นบทความแนะนำแล้ว"
              )
            }
          >
            <Star className={`mr-2 h-4 w-4 ${isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`} />
            {isFeatured ? "ยกเลิกแนะนำ" : "ตั้งเป็นแนะนำ"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            เปลี่ยนสถานะ
          </DropdownMenuLabel>
          {(Object.keys(statusLabels) as Status[])
            .filter((s) => s !== status)
            .map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => patch({ status: s }, `เปลี่ยนเป็น "${statusLabels[s]}" แล้ว`)}
              >
                {statusLabels[s]}
              </DropdownMenuItem>
            ))}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ลบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบบทความนี้?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ บทความและความคิดเห็นทั้งหมดจะถูกลบถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={loading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
