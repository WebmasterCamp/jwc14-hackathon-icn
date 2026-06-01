"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface Product {
  id: string;
  name: string;
  nameTh: string | null;
  images: string[];
  isFeatured: boolean;
  category: { nameTh: string; name: string };
  _count: { equipment: number };
}

export function FeaturedProductsManager({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(products);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.nameTh ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  async function toggle(product: Product, next: boolean) {
    // Optimistic update; revert on failure.
    setItems((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isFeatured: next } : p))
    );
    setPending((p) => ({ ...p, [product.id]: true }));
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "บันทึกไม่สำเร็จ");
      }
      toast.success(next ? "เพิ่มเป็นสินค้าแนะนำแล้ว" : "นำออกจากสินค้าแนะนำแล้ว");
      router.refresh();
    } catch (err) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isFeatured: !next } : p
        )
      );
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setPending((p) => ({ ...p, [product.id]: false }));
    }
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
          filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <ImageWithFallback
                    src={product.images[0]}
                    alt={product.nameTh || product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    {product.isFeatured && (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-brand text-brand" />
                    )}
                    {product.nameTh || product.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {product.category.nameTh}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {product._count.equipment} ร้านค้า
                </Badge>
              </div>

              <Switch
                checked={product.isFeatured}
                disabled={pending[product.id]}
                onCheckedChange={(v) => toggle(product, v)}
                aria-label="สินค้าแนะนำ"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
