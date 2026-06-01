"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CommentActions({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run(method: "POST" | "DELETE", path: string, msg: string) {
    setLoading(true);
    try {
      const res = await fetch(path, { method });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ไม่สำเร็จ");
      }
      toast.success(msg);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() =>
          run("POST", `/api/blog/comments/${commentId}/approve`, "อนุมัติความคิดเห็นแล้ว")
        }
      >
        <Check className="mr-1 h-4 w-4" />
        อนุมัติ
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        className="text-destructive hover:text-destructive"
        onClick={() =>
          run("DELETE", `/api/blog/comments/${commentId}`, "ลบความคิดเห็นแล้ว")
        }
      >
        <Trash2 className="mr-1 h-4 w-4" />
        ลบ
      </Button>
    </div>
  );
}
