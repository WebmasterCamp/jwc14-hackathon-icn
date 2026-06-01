import { Suspense } from "react";
import Link from "next/link";
import { getVerifiedProviders } from "@/lib/queries";

export const revalidate = 600; // ISR: revalidate every 10 minutes
import {
  Building2,
  MapPin,
  Star,
  Package,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

async function ProvidersList() {
  const providers = await getVerifiedProviders();

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ยังไม่มีผู้ให้บริการในระบบ</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => {
        // Type assertion for equipment relation
        const providerWithEquipment = provider as typeof provider & {
          equipment: { id: string }[];
        };
        const equipmentCount = providerWithEquipment.equipment?.length || 0;

        return (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg truncate">
                      {provider.companyName}
                    </CardTitle>
                    {provider.verified && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {provider.description || "ผู้ให้บริการอุปกรณ์การศึกษา"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{provider.province || "ไม่ระบุ"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>{equipmentCount} อุปกรณ์</span>
                </div>
              </div>

              <Button className="w-full" variant="outline" asChild>
                <Link href={`/providers/${provider.id}`}>
                  ดูรายละเอียด
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ProvidersListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4">
          พันธมิตรที่เชื่อถือได้
        </Badge>
        <h1 className="text-3xl font-bold mb-2">ผู้ให้บริการทั้งหมด</h1>
        <p className="text-muted-foreground max-w-2xl">
          ผู้จัดจำหน่ายอุปกรณ์ STEM และ IoT ที่ผ่านการตรวจสอบและรับรองจาก Sparkgo
          พร้อมให้บริการโรงเรียนทั่วประเทศ
        </p>
      </div>

      <Suspense fallback={<ProvidersListSkeleton />}>
        <ProvidersList />
      </Suspense>

      {/* CTA */}
      <div className="mt-12 p-8 bg-muted/50 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-2">สนใจเป็นผู้ให้บริการ?</h2>
        <p className="text-muted-foreground mb-4">
          เข้าถึงโรงเรียนกว่า 500 แห่งทั่วประเทศผ่านแพลตฟอร์มของเรา
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up/provider">
            สมัครเป็นผู้ให้บริการ
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
