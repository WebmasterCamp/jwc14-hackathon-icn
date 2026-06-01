"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Percent, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PriceTier {
  id: string;
  minMonths: number;
  maxMonths: number | null;
  discountPercent: number;
}

interface ProductRow {
  id: string;
  name: string;
  nameTh: string | null;
  category: { nameTh: string; name: string };
  priceTiers: PriceTier[];
}

function tierLabel(t: PriceTier) {
  const range =
    t.maxMonths == null
      ? `${t.minMonths}+ เดือน`
      : `${t.minMonths}–${t.maxMonths} เดือน`;
  return `${range} · −${t.discountPercent}%`;
}

const EMPTY = { minMonths: "", maxMonths: "", discountPercent: "" };

export function ProductPricingManager({
  products,
}: {
  products: ProductRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<ProductRow | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.nameTh ?? "").toLowerCase().includes(q)
    );
  });

  async function addTier(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/products/${active.id}/price-tiers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minMonths: form.minMonths,
            maxMonths: form.maxMonths.trim() === "" ? null : form.maxMonths,
            discountPercent: form.discountPercent,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "เพิ่มไม่สำเร็จ");
      }
      toast.success("เพิ่มขั้นส่วนลดแล้ว");
      setForm(EMPTY);
      router.refresh();
      // Reflect the new tier in the open dialog without waiting for a full reload.
      const created: PriceTier = await res.json();
      setActive({ ...active, priceTiers: [...active.priceTiers, created] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function removeTier(tierId: string) {
    if (!active) return;
    try {
      const res = await fetch(
        `/api/admin/products/${active.id}/price-tiers/${tierId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "ลบไม่สำเร็จ");
      }
      toast.success("ลบขั้นส่วนลดแล้ว");
      router.refresh();
      setActive({
        ...active,
        priceTiers: active.priceTiers.filter((t) => t.id !== tierId),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  function openManage(p: ProductRow) {
    setActive(p);
    setForm(EMPTY);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="pl-9"
        />
      </div>

      <div className="divide-y rounded-lg border">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">ไม่พบสินค้า</p>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{p.nameTh || p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category.nameTh}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.priceTiers.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      ยังไม่มีส่วนลด
                    </span>
                  ) : (
                    p.priceTiers.map((t) => (
                      <Badge key={t.id} variant="secondary">
                        {tierLabel(t)}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => openManage(p)}
              >
                <Percent className="mr-2 h-4 w-4" />
                จัดการส่วนลด
              </Button>
              <Dialog
                open={active?.id === p.id}
                onOpenChange={(o) => (o ? openManage(p) : setActive(null))}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      ส่วนลดของ “{active?.nameTh || active?.name}”
                    </DialogTitle>
                  </DialogHeader>

                  {/* Existing tiers */}
                  <div className="divide-y rounded-lg border">
                    {active && active.priceTiers.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">
                        ยังไม่มีขั้นส่วนลด
                      </p>
                    ) : (
                      active?.priceTiers.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-3 p-3 text-sm"
                        >
                          <span>{tierLabel(t)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeTier(t.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add tier */}
                  <form onSubmit={addTier} className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium">
                        เดือนต่ำสุด *
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={form.minMonths}
                        onChange={(e) =>
                          setForm({ ...form, minMonths: e.target.value })
                        }
                        placeholder="12"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">เดือนสูงสุด</label>
                      <Input
                        type="number"
                        min={1}
                        value={form.maxMonths}
                        onChange={(e) =>
                          setForm({ ...form, maxMonths: e.target.value })
                        }
                        placeholder="ว่าง = ไม่จำกัด"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">ส่วนลด % *</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={form.discountPercent}
                        onChange={(e) =>
                          setForm({ ...form, discountPercent: e.target.value })
                        }
                        placeholder="10"
                        className="mt-1"
                      />
                    </div>
                    <div className="col-span-3">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          loading ||
                          !form.minMonths.trim() ||
                          !form.discountPercent.trim()
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        เพิ่มขั้นส่วนลด
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
