"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  nameTh: string;
  description?: string | null;
  icon?: string | null;
  _count?: { products: number };
}

const EMPTY = { name: "", nameTh: "", description: "", icon: "" };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.nameTh.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          nameTh: form.nameTh.trim(),
          description: form.description.trim() || undefined,
          icon: form.icon.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "สร้างไม่สำเร็จ");
      }
      toast.success("เพิ่มหมวดหมู่แล้ว");
      setForm(EMPTY);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setEditForm({
      name: cat.name,
      nameTh: cat.nameTh,
      description: cat.description || "",
      icon: cat.icon || "",
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editForm.name.trim() || !editForm.nameTh.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          nameTh: editForm.nameTh.trim(),
          description: editForm.description.trim() || undefined,
          icon: editForm.icon.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "บันทึกไม่สำเร็จ");
      }
      toast.success("บันทึกแล้ว");
      setEditing(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
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
      <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">ชื่อ (อังกฤษ) *</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">ชื่อ (ไทย) *</label>
          <Input
            value={form.nameTh}
            onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">ไอคอน (อิโมจิ)</label>
          <Input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="🤖"
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">คำอธิบาย</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            type="submit"
            disabled={loading || !form.name.trim() || !form.nameTh.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มหมวดหมู่
          </Button>
        </div>
      </form>

      <div className="divide-y rounded-lg border">
        {categories.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">ยังไม่มีหมวดหมู่</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {cat.icon && <span className="text-xl">{cat.icon}</span>}
                <div className="min-w-0">
                  <span className="font-medium">{cat.nameTh || cat.name}</span>
                  {cat.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {cat.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">
                  {cat._count?.products ?? 0} สินค้า
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      />
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ลบหมวดหมู่ “{cat.nameTh || cat.name}”?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {(cat._count?.products ?? 0) > 0
                          ? `หมวดหมู่นี้มีสินค้า ${cat._count?.products} รายการ ต้องย้ายหรือลบสินค้าก่อนจึงจะลบได้`
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
            </div>
          ))
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">ชื่อ (อังกฤษ) *</label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ชื่อ (ไทย) *</label>
              <Input
                value={editForm.nameTh}
                onChange={(e) =>
                  setEditForm({ ...editForm, nameTh: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ไอคอน (อิโมจิ)</label>
              <Input
                value={editForm.icon}
                onChange={(e) =>
                  setEditForm({ ...editForm, icon: e.target.value })
                }
                placeholder="🤖"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">คำอธิบาย</label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={2}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={
                  loading || !editForm.name.trim() || !editForm.nameTh.trim()
                }
              >
                บันทึก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
