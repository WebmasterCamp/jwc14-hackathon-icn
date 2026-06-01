"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Package } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface EquipmentCardProps {
  equipment: {
    id: string;
    name: string;
    nameTh?: string | null;
    description?: string | null;
    images: string[];
    rentPriceMonthly: number;
    leaseToOwnPrice?: number | null;
    depositAmount: number;
    availableStock: number;
    condition: string;
    category: {
      name: string;
      nameTh: string;
    };
    provider: {
      companyName: string;
      province?: string | null;
      rating: number;
    };
  };
}

const conditionLabels: Record<string, string> = {
  NEW: "ใหม่",
  EXCELLENT: "ดีเยี่ยม",
  GOOD: "ดี",
  FAIR: "พอใช้",
};

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const imageUrl = equipment.images[0] || "/images/placeholder-equipment.jpg";

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/equipment/${equipment.id}`}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={equipment.nameTh || equipment.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant="secondary">{equipment.category.nameTh}</Badge>
            {equipment.condition === "NEW" && (
              <Badge className="bg-green-500">ใหม่</Badge>
            )}
          </div>
          {equipment.availableStock <= 3 && equipment.availableStock > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2"
            >
              เหลือ {equipment.availableStock} ชิ้น
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/equipment/${equipment.id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {equipment.nameTh || equipment.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {equipment.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{equipment.provider.province || "ไม่ระบุ"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{equipment.provider.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{conditionLabels[equipment.condition]}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(equipment.rentPriceMonthly)}
          </span>
          <span className="text-muted-foreground">/เดือน</span>
        </div>
        {equipment.leaseToOwnPrice && (
          <p className="text-sm text-muted-foreground">
            หรือเช่าซื้อ {formatPrice(equipment.leaseToOwnPrice)}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/equipment/${equipment.id}`}>ดูรายละเอียด</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href={`/equipment/${equipment.id}#quote`}>ขอใบเสนอราคา</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
