"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentForm({ postId }: { postId: string }) {
  const { data: session, status } = useSession();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "loading") {
    return <div className="h-24 animate-pulse rounded-md bg-muted" />;
  }

  if (!session?.user) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          เข้าสู่ระบบ
        </Link>{" "}
        เพื่อแสดงความคิดเห็น
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }

      setContent("");
      toast.success("ส่งความคิดเห็นแล้ว ความคิดเห็นของคุณรอการอนุมัติ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สามารถส่งความคิดเห็นได้");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="แสดงความคิดเห็น..."
        rows={4}
        maxLength={2000}
        required
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
        </Button>
      </div>
    </form>
  );
}
