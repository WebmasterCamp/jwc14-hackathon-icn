import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import {
  Building2,
  Eye,
  CheckCircle2,
  MapPin,
  Star,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatThaiDate } from "@/lib/format";
import { ProviderActions } from "@/components/admin/provider-actions";

export default async function AdminProvidersPage() {
  const providers = await prisma.provider.findMany({
    include: {
      user: {
        select: {
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          equipment: true,
          contracts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const verifiedProviders = providers.filter((p) => p.verified);
  const pendingProviders = providers.filter((p) => !p.verified);

  const ProviderTable = ({
    providers,
  }: {
    providers: typeof verifiedProviders;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>บริษัท</TableHead>
          <TableHead>ติดต่อ</TableHead>
          <TableHead>จังหวัด</TableHead>
          <TableHead>อุปกรณ์</TableHead>
          <TableHead>สัญญา</TableHead>
          <TableHead>คะแนน</TableHead>
          <TableHead>วันที่สมัคร</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider) => (
          <TableRow key={provider.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{provider.companyName}</p>
                  {provider.taxId && (
                    <p className="text-xs text-muted-foreground">
                      Tax: {provider.taxId}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <p>{provider.user.email}</p>
                <p className="text-muted-foreground">{provider.user.phone}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" />
                {provider.province || "-"}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm">
                <Package className="h-3 w-3" />
                {provider._count.equipment}
              </div>
            </TableCell>
            <TableCell>{provider._count.contracts}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {provider.rating.toFixed(1)}
              </div>
            </TableCell>
            <TableCell>
              {formatThaiDate(provider.createdAt, "d MMM yy")}
            </TableCell>
            <TableCell>
              <Badge variant={provider.verified ? "default" : "secondary"}>
                {provider.verified ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    ยืนยันแล้ว
                  </>
                ) : (
                  "รอยืนยัน"
                )}
              </Badge>
            </TableCell>
            <TableCell>
              <ProviderActions
                providerId={provider.id}
                providerName={provider.companyName}
                verified={provider.verified}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ผู้ให้บริการทั้งหมด</h1>
        <p className="text-muted-foreground">
          จัดการผู้ให้บริการในระบบ
        </p>
      </div>

      <Tabs defaultValue={pendingProviders.length > 0 ? "pending" : "verified"}>
        <TabsList>
          <TabsTrigger value="pending">
            รอยืนยัน ({pendingProviders.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            ยืนยันแล้ว ({verifiedProviders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>ผู้ให้บริการรอการยืนยัน</CardTitle>
              <CardDescription>
                ตรวจสอบและอนุมัติผู้ให้บริการใหม่
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProviders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    ไม่มีผู้ให้บริการรอการยืนยัน
                  </p>
                </div>
              ) : (
                <ProviderTable providers={pendingProviders} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle>ผู้ให้บริการที่ยืนยันแล้ว</CardTitle>
              <CardDescription>
                ผู้ให้บริการที่ใช้งานระบบได้แล้ว
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verifiedProviders.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    ยังไม่มีผู้ให้บริการในระบบ
                  </p>
                </div>
              ) : (
                <ProviderTable providers={verifiedProviders} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
