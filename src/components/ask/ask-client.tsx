"use client";

import { useState } from "react";
import { Sparkles, Send, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/equipment/product-card";

interface Recommendation {
  product: React.ComponentProps<typeof ProductCard>["product"];
  reason: string;
}

interface AskResponse {
  summary: string;
  recommendations: Recommendation[];
  error?: string;
}

const EXAMPLES = [
  "อยากทำชมรมหุ่นยนต์เดินตามเส้นสำหรับนักเรียน ป.5",
  "โครงงาน IoT รดน้ำต้นไม้อัตโนมัติ",
  "สอนพิมพ์ 3 มิติเบื้องต้นในห้องเรียน",
  "ชุดอุปกรณ์สอนเขียนโค้ดสำหรับเด็กประถม",
];

export function AskClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 5) {
      toast.error("กรุณาอธิบายโครงงานของคุณอย่างน้อย 5 ตัวอักษร");
      return;
    }

    setLoading(true);
    setSubmitted(true);
    setResult(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data: AskResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถดึงคำแนะนำได้");
      }
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setResult(null);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
          }}
          placeholder="อธิบายโครงงานหรือสิ่งที่อยากสอน เช่น ‘อยากทำโครงงานวัดคุณภาพอากาศในโรงเรียน’"
          className="min-h-[120px] text-base"
          maxLength={500}
          disabled={loading}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{query.length}/500</p>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              "กำลังค้นหา..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                แนะนำอุปกรณ์
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Example chips */}
      {!submitted && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            ตัวอย่างคำถาม
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setQuery(ex)}
                className="rounded-full border bg-card px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:border-brand hover:text-brand"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div className="space-y-6">
          {result.summary && (
            <Card className="border-brand/30 bg-brand/5">
              <CardContent className="flex gap-3 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          )}

          {result.recommendations.length === 0 ? (
            <div className="rounded-2xl border border-dashed py-12 text-center">
              <p className="text-muted-foreground">
                ยังไม่พบอุปกรณ์ที่เกี่ยวข้อง ลองอธิบายโครงงานให้ละเอียดขึ้น
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {result.recommendations.map((rec) => (
                <div key={rec.product.slug} className="flex flex-col gap-2">
                  <ProductCard product={rec.product} />
                  {rec.reason && (
                    <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      {rec.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
