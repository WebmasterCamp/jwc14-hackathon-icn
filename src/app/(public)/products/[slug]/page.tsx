import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export const revalidate = 600; // ISR: revalidate every 10 minutes
import {
  ArrowLeft,
  MapPin,
  Star,
  Package,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Store,
  FileText,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferingCalculator } from "@/components/equipment/offering-calculator";
import { AddToQuoteButton } from "@/components/quote/add-to-quote-button";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/structured-data";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

const conditionLabels: Record<string, string> = {
  NEW: "ใหม่",
  EXCELLENT: "ดีเยี่ยม",
  GOOD: "ดี",
  FAIR: "พอใช้",
};

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, nameTh: true, description: true, descriptionTh: true },
  });

  if (!product) {
    return { title: "ไม่พบสินค้า" };
  }

  return {
    title: product.nameTh || product.name,
    description: product.descriptionTh || product.description || undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  // Need an active product with at least one visible offering.
  if (!product || !product.isActive || product.equipment.length === 0) {
    notFound();
  }

  const offerings = product.equipment; // already sorted by price asc
  const cheapest = offerings[0];
  const specs = product.specs as Record<string, string> | null;
  const displayName = product.nameTh || product.name;

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd
        data={[
          generateProductSchema({
            slug: product.slug,
            name: product.name,
            nameTh: product.nameTh ?? undefined,
            description: product.description ?? undefined,
            descriptionTh: product.descriptionTh ?? undefined,
            images: product.images,
            brand: product.brand ?? undefined,
            category: {
              name: product.category.name,
              nameTh: product.category.nameTh,
            },
            offers: offerings.map((o) => ({
              price: o.rentPriceMonthly,
              sellerName: o.provider.companyName,
              availableStock: o.availableStock,
              condition: o.condition,
            })),
          }),
          generateBreadcrumbSchema([
            { name: "หน้าแรก", url: "/" },
            { name: "อุปกรณ์ทั้งหมด", url: "/product" },
            { name: displayName, url: `/products/${product.slug}` },
          ]),
        ]}
      />

      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/product"
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
            <ImageWithFallback
              src={product.images[0]}
              alt={displayName}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="secondary">{product.category.nameTh}</Badge>
              {offerings.length > 1 && (
                <Badge className="bg-primary">
                  <Store className="mr-1 h-3 w-3" />
                  {offerings.length} ร้านค้า
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Title & Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
            {product.nameTh && product.name !== product.nameTh && (
              <p className="text-lg text-muted-foreground mb-4">
                {product.name}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Store className="h-4 w-4" />
                <span>{offerings.length} ร้านค้าที่จำหน่าย</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>เริ่มต้น {formatPrice(cheapest.rentPriceMonthly)}/เดือน</span>
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
                    {product.descriptionTh ||
                      product.description ||
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
                          <dd className="text-muted-foreground">
                            {String(value)}
                          </dd>
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
                  {product.curriculum.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.curriculum.map((item) => (
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

          {/* Shop list hidden per request */}
          {false && (
          <div id="shops" className="space-y-4 scroll-mt-20">
            <h2 className="text-xl font-bold">ร้านค้าที่จำหน่ายสินค้านี้</h2>
            <p className="text-sm text-muted-foreground">
              เปรียบเทียบราคา ประกัน และเงื่อนไขจากแต่ละร้านค้า
            </p>

            {offerings.map((offering) => (
              <Card key={offering.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Provider info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {offering.provider.companyName}
                          </h3>
                          {offering.provider.verified && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {offering.provider.province || "ไม่ระบุ"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {offering.provider.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            {conditionLabels[offering.condition]}
                          </span>
                        </div>

                        {/* Warranty (ประกัน) */}
                        <div className="flex items-center gap-1.5 mt-2 text-sm">
                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                          <span>
                            {offering.insuranceMonths
                              ? `รับประกัน ${offering.insuranceMonths} เดือน`
                              : "สอบถามเงื่อนไขการรับประกันกับร้านค้า"}
                          </span>
                        </div>

                        {/* Conditions (เงื่อนไข) */}
                        {offering.conditions && (
                          <div className="flex items-start gap-1.5 mt-1.5 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                            <span className="whitespace-pre-wrap">
                              {offering.conditions}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price + actions */}
                    <div className="text-right shrink-0">
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="text-2xl font-bold text-primary">
                          {formatPrice(offering.rentPriceMonthly)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /เดือน
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        มัดจำ {formatPrice(offering.depositAmount)}
                      </p>
                      {offering.leaseToOwnPrice && (
                        <p className="text-xs text-muted-foreground">
                          เช่าซื้อ {formatPrice(offering.leaseToOwnPrice)}
                        </p>
                      )}
                      <div className="flex flex-col gap-2 mt-3">
                        <AddToQuoteButton
                          offering={{
                            equipmentId: offering.id,
                            name: product!.name,
                            nameTh: product!.nameTh,
                            rentPriceMonthly: offering.rentPriceMonthly,
                            depositAmount: offering.depositAmount,
                            provider: {
                              id: offering.provider.id,
                              companyName: offering.provider.companyName,
                            },
                            priceTiers: product!.priceTiers.map((t) => ({
                              minMonths: t.minMonths,
                              maxMonths: t.maxMonths,
                              discountPercent: t.discountPercent,
                            })),
                          }}
                        />
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/providers/${offering.provider.id}`}>
                            ดูร้านค้า
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground font-normal">
                  เริ่มต้น
                </span>
                <span className="text-3xl">
                  {formatPrice(cheapest.rentPriceMonthly)}
                </span>
                <span className="text-lg text-muted-foreground font-normal">
                  /เดือน
                </span>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Price calculator with shop/offering selection (defaults cheapest) */}
          <OfferingCalculator
            offerings={offerings.map((o) => ({
              id: o.id,
              providerName: o.provider.companyName,
              rentPriceMonthly: o.rentPriceMonthly,
              leaseToOwnPrice: o.leaseToOwnPrice,
              leaseDuration: o.leaseDuration,
              depositAmount: o.depositAmount,
            }))}
            priceTiers={product.priceTiers.map((t) => ({
              minMonths: t.minMonths,
              maxMonths: t.maxMonths,
              discountPercent: t.discountPercent,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
