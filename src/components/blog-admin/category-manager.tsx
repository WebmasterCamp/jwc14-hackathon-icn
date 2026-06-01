"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

interface Category {
  id: string;
  name: string;
  nameTh?: string | null;
  _count?: { posts: number };
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [loading, setLoading] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), nameTh: nameTh.trim() || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "สร้างไม่สำเร็จ");
      }
      toast.success("เพิ่มหมวดหมู่แล้ว");
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
      const res = await fetch(`/api/blog/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ลบไม่สำเร็จ");
      }
      toast.success("ลบหมวดหมู่แล้ว");
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

      <div className="divide-y rounded-lg border">
        {categories.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">ยังไม่มีหมวดหมู่</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3">
                <span className="font-medium">{cat.nameTh || cat.name}</span>
                <Badge variant="secondary">{cat._count?.posts ?? 0} บทความ</Badge>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>ลบหมวดหมู่ "{cat.nameTh || cat.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {(cat._count?.posts ?? 0) > 0
                        ? `หมวดหมู่นี้ถูกใช้ใน ${cat._count?.posts} บทความ การลบจะเอาหมวดหมู่ออกจากบทความเหล่านั้น`
                        : "การกระทำนี้ไม่สามารถย้อนกลับได้"}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => remove(cat.id)}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      ลบ
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
