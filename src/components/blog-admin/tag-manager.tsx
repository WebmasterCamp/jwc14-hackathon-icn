"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Tag {
  id: string;
  name: string;
  nameTh?: string | null;
  _count?: { posts: number };
}

export function TagManager({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [loading, setLoading] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/blog/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), nameTh: nameTh.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "สร้างไม่สำเร็จ");
      }
      toast.success("เพิ่มแท็กแล้ว");
      setName("");
      setNameTh("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/blog/tags/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ลบไม่สำเร็จ");
      }
      toast.success("ลบแท็กแล้ว");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm font-medium">ชื่อ (อังกฤษ) *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-sm font-medium">ชื่อ (ไทย)</label>
          <Input value={nameTh} onChange={(e) => setNameTh(e.target.value)} className="mt-1" />
        </div>
        <Button type="submit" disabled={loading || !name.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่ม
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีแท็ก</p>
        ) : (
          tags.map((tag) => (
            <AlertDialog key={tag.id}>
              <Badge variant="secondary" className="gap-2 py-1.5 pl-3 pr-2">
                {tag.nameTh || tag.name}
                <span className="text-xs text-muted-foreground">
                  ({tag._count?.posts ?? 0})
                </span>
                <AlertDialogTrigger
                  render={
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-destructive"
                    />
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </AlertDialogTrigger>
              </Badge>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ลบแท็ก "{tag.nameTh || tag.name}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {(tag._count?.posts ?? 0) > 0
                      ? `แท็กนี้ถูกใช้ใน ${tag._count?.posts} บทความ การลบจะเอาแท็กออกจากบทความเหล่านั้น`
                      : "การกระทำนี้ไม่สามารถย้อนกลับได้"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => remove(tag.id)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    ลบ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))
        )}
      </div>
    </div>
  );
}
