"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Pencil, EyeOff } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/blog-admin/image-upload-field";

interface ProjectExample {
  id: string;
  title: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY = { title: "", image: "", sortOrder: "", isActive: true };

export function ProjectExampleManager({
  projects,
}: {
  projects: ProjectExample[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ProjectExample | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/project-examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          image: form.image,
          sortOrder: form.sortOrder.trim()
            ? Number(form.sortOrder)
            : undefined,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "สร้างไม่สำเร็จ");
      }
      toast.success("เพิ่มตัวอย่างโปรเจกต์แล้ว");
      setForm(EMPTY);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(project: ProjectExample) {
    setEditing(project);
    setEditForm({
      title: project.title,
      image: project.image,
      sortOrder: String(project.sortOrder),
      isActive: project.isActive,
    });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editForm.title.trim() || !editForm.image) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/project-examples/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          image: editForm.image,
          sortOrder: editForm.sortOrder.trim()
            ? Number(editForm.sortOrder)
            : undefined,
          isActive: editForm.isActive,
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
      const res = await fetch(`/api/admin/project-examples/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ลบไม่สำเร็จ");
      }
      toast.success("ลบตัวอย่างโปรเจกต์แล้ว");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">ชื่อ/ป้ายกำกับ *</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="ตัวอย่าง#01"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">ลำดับการแสดง</label>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            placeholder="ต่อท้ายอัตโนมัติ"
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">รูปภาพโปรเจกต์ *</label>
          <div className="mt-1">
            <ImageUploadField
              value={form.image || undefined}
              onChange={(url) => setForm({ ...form, image: url ?? "" })}
              folder="projects"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="new-active"
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="new-active" className="text-sm font-medium">
            แสดงบนหน้าแรก
          </label>
        </div>
        <div className="sm:col-span-2">
          <Button
            type="submit"
            disabled={loading || !form.title.trim() || !form.image}
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มตัวอย่างโปรเจกต์
          </Button>
        </div>
      </form>

      <div className="divide-y rounded-lg border">
        {projects.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            ยังไม่มีตัวอย่างโปรเจกต์
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {project.image && (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-medium">{project.title}</span>
                  <p className="text-xs text-muted-foreground">
                    ลำดับ {project.sortOrder}
                  </p>
                </div>
                {!project.isActive && (
                  <Badge variant="secondary" className="gap-1">
                    <EyeOff className="h-3 w-3" />
                    ซ่อน
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(project)}
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
                        ลบตัวอย่างโปรเจกต์ “{project.title}”?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        การกระทำนี้ไม่สามารถย้อนกลับได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => remove(project.id)}
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
            <DialogTitle>แก้ไขตัวอย่างโปรเจกต์</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-3">
            <div>
              <label className="text-sm font-medium">ชื่อ/ป้ายกำกับ *</label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ลำดับการแสดง</label>
              <Input
                type="number"
                value={editForm.sortOrder}
                onChange={(e) =>
                  setEditForm({ ...editForm, sortOrder: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">รูปภาพโปรเจกต์ *</label>
              <div className="mt-1">
                <ImageUploadField
                  value={editForm.image || undefined}
                  onChange={(url) =>
                    setEditForm({ ...editForm, image: url ?? "" })
                  }
                  folder="projects"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="edit-active"
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) =>
                  setEditForm({ ...editForm, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="edit-active" className="text-sm font-medium">
                แสดงบนหน้าแรก
              </label>
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
                disabled={loading || !editForm.title.trim() || !editForm.image}
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
