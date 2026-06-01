"use client";

import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    nameTh?: string | null;
    description?: string | null;
    images: string[];
    category: {
      name: string;
      nameTh: string;
    };
    fromPrice: number;
    offeringCount: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images[0] || "/images/placeholder-equipment.jpg";
  const href = `/products/${product.slug}`;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={href}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={product.nameTh || product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant="secondary">{product.category.nameTh}</Badge>
          </div>
          {product.offeringCount > 1 && (
            <Badge className="absolute top-2 right-2 bg-primary">
              <Store className="mr-1 h-3 w-3" />
              {product.offeringCount} ร้านค้า
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={href}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.nameTh || product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Store className="h-4 w-4" />
          <span>
            {product.offeringCount > 1
              ? `เปรียบเทียบ ${product.offeringCount} ร้านค้า`
              : "1 ร้านค้า"}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-sm text-muted-foreground">เริ่มต้น</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(product.fromPrice)}
          </span>
          <span className="text-muted-foreground">/เดือน</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link href={href}>ดูร้านค้าทั้งหมด</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
