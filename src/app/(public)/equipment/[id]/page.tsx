import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const revalidate = 600; // ISR: revalidate every 10 minutes
import {
  ArrowLeft,
  MapPin,
  Star,
  Package,
  Shield,
  Truck,
  Phone,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getEquipmentById } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PriceCalculator } from "@/components/equipment/price-calculator";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/components/seo/json-ld";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

interface EquipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

const conditionLabels: Record<string, string> = {
  NEW: "ใหม่",
  EXCELLENT: "ดีเยี่ยม",
  GOOD: "ดี",
  FAIR: "พอใช้",
};

export async function generateStaticParams() {
  // Pre-generate top 50 most popular equipment pages
  const equipment = await prisma.equipment.findMany({
    where: { isActive: true },
    select: { id: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return equipment.map((item) => ({
    id: item.id,
  }));
}

export const dynamicParams = true; // Generate other pages on-demand

export async function generateMetadata({
  params,
}: EquipmentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    select: { name: true, nameTh: true, description: true },
  });

  if (!equipment) {
    return { title: "ไม่พบอุปกรณ์" };
  }

  return {
    title: equipment.nameTh || equipment.name,
    description: equipment.description || undefined,
  };
}

export default async function EquipmentDetailPage({
  params,
}: EquipmentDetailPageProps) {
  const { id } = await params;

  const equipment = await getEquipmentById(id);

  if (!equipment || !equipment.isActive) {
    notFound();
  }

  // Type assertion to ensure TypeScript recognizes the included relations
  const equipmentWithRelations = equipment as NonNullable<typeof equipment> & {
    category: { id: string; name: string; nameTh: string; slug: string };
    provider: {
      id: string;
      companyName: string;
      description: string | null;
      province: string | null;
      rating: number;
      verified: boolean;
      user: { name: string | null; phone: string | null };
    };
  };

  const specs = equipmentWithRelations.specs as Record<string, string> | null;

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd
        data={[
          generateProductSchema({
            id: equipmentWithRelations.id,
            name: equipmentWithRelations.name,
            nameTh: equipmentWithRelations.nameTh ?? undefined,
            description: equipmentWithRelations.description ?? undefined,
            descriptionTh: equipmentWithRelations.descriptionTh ?? undefined,
            images: equipmentWithRelations.images,
            rentPriceMonthly: equipmentWithRelations.rentPriceMonthly,
            leaseToOwnPrice: equipmentWithRelations.leaseToOwnPrice ?? undefined,
            condition: equipmentWithRelations.condition,
            category: {
              name: equipmentWithRelations.category.name,
              nameTh: equipmentWithRelations.category.nameTh,
            },
            provider: {
              companyName: equipmentWithRelations.provider.companyName,
              rating: equipmentWithRelations.provider.rating,
            },
            availableStock: equipmentWithRelations.availableStock,
          }),
          generateBreadcrumbSchema([
            { name: "หน้าแรก", url: "/" },
            { name: "อุปกรณ์ทั้งหมด", url: "/equipment" },
            {
              name: equipmentWithRelations.nameTh || equipmentWithRelations.name,
              url: `/equipment/${equipmentWithRelations.id}`,
            },
          ]),
        ]}
      />
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/equipment"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปหน้าอุปกรณ์ทั้งหมด
        </Link>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
            <Image
              src={equipmentWithRelations.images[0] || "/images/placeholder-equipment.jpg"}
              alt={equipmentWithRelations.nameTh || equipmentWithRelations.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="secondary">{equipmentWithRelations.category.nameTh}</Badge>
              {equipmentWithRelations.condition === "NEW" && (
                <Badge className="bg-green-500">ใหม่</Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {equipmentWithRelations.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {equipmentWithRelations.images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                >
                  <Image
                    src={image}
                    alt={`${equipmentWithRelations.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Title & Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {equipmentWithRelations.nameTh || equipmentWithRelations.name}
            </h1>
            {equipmentWithRelations.nameTh && equipmentWithRelations.name !== equipmentWithRelations.nameTh && (
              <p className="text-lg text-muted-foreground mb-4">
                {equipmentWithRelations.name}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{equipmentWithRelations.provider.province || "ไม่ระบุ"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{equipmentWithRelations.provider.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>สภาพ: {conditionLabels[equipmentWithRelations.condition]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>พร้อมให้เช่า: {equipmentWithRelations.availableStock} ชิ้น</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">รายละเอียด</TabsTrigger>
              <TabsTrigger value="specs">สเปค</TabsTrigger>
              <TabsTrigger value="curriculum">หลักสูตร</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="whitespace-pre-wrap">
                    {equipmentWithRelations.descriptionTh ||
                      equipmentWithRelations.description ||
                      "ไม่มีรายละเอียดเพิ่มเติม"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {specs ? (
                    <dl className="space-y-3">
                      {Object.entries(specs).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-2 border-b last:border-0"
                        >
                          <dt className="font-medium capitalize">{key}</dt>
                          <dd className="text-muted-foreground">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-muted-foreground">ไม่มีข้อมูลสเปค</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {equipmentWithRelations.curriculum.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {equipmentWithRelations.curriculum.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      ไม่มีข้อมูลหลักสูตรที่เกี่ยวข้อง
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ผู้ให้บริการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {equipmentWithRelations.provider.companyName}
                    </h3>
                    {equipmentWithRelations.provider.verified && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {equipmentWithRelations.provider.description || "ผู้ให้บริการอุปกรณ์การศึกษา"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{equipmentWithRelations.provider.province}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{equipmentWithRelations.provider.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/providers/${equipmentWithRelations.provider.id}`}>
                    ดูโปรไฟล์
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-3xl">{formatPrice(equipmentWithRelations.rentPriceMonthly)}</span>
                <span className="text-lg text-muted-foreground font-normal">/เดือน</span>
              </CardTitle>
              {equipmentWithRelations.leaseToOwnPrice && (
                <CardDescription>
                  หรือเช่าซื้อ {formatPrice(equipmentWithRelations.leaseToOwnPrice)}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ค่ามัดจำ</span>
                  <span className="font-medium">
                    {formatPrice(equipmentWithRelations.depositAmount)}
                  </span>
                </div>
                {equipmentWithRelations.leaseDuration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ระยะเวลาเช่าซื้อ</span>
                    <span className="font-medium">{equipmentWithRelations.leaseDuration} เดือน</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-green-500" />
                  <span>จัดส่งฟรีทั่วประเทศ</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>รับประกันการใช้งาน</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-purple-500" />
                  <span>ซัพพอร์ตตลอดสัญญา</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button className="w-full" size="lg" id="quote">
                  ขอใบเสนอราคา
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  ติดต่อผู้ให้บริการ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price Calculator */}
          <PriceCalculator
            rentPriceMonthly={equipmentWithRelations.rentPriceMonthly}
            leaseToOwnPrice={equipmentWithRelations.leaseToOwnPrice}
            leaseDuration={equipmentWithRelations.leaseDuration}
            depositAmount={equipmentWithRelations.depositAmount}
          />
        </div>
      </div>
    </div>
  );
}
