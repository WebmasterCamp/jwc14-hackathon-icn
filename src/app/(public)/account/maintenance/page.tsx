import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Wrench, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatThaiDate } from "@/lib/format";
import { ensureCustomerProfile } from "@/lib/queries";

const STATUS_LABELS = {
  PENDING: "รอดำเนินการ",
  IN_PROGRESS: "กำลังดำเนินการ",
  RESOLVED: "แก้ไขแล้ว",
  CLOSED: "ปิดงาน",
};

const STATUS_ICONS = {
  PENDING: Clock,
  IN_PROGRESS: Wrench,
  RESOLVED: CheckCircle2,
  CLOSED: XCircle,
};

export default async function CustomerMaintenancePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") return null;

  // Guarantee the profile row exists so we never redirect-loop with middleware.
  await ensureCustomerProfile(session.user.id, session.user.name);

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
  });

  if (!customer) return null;

  const requests = await prisma.maintenanceRequest.findMany({
    where: { customerId: customer.id },
    include: {
      equipment: {
        include: {
          category: true,
          provider: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const groupedByStatus = Object.keys(STATUS_LABELS).map((status) => ({
    status,
    label: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    requests: requests.filter((r) => r.status === status),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">คำขอซ่อมบำรุง</h1>
          <p className="text-muted-foreground">
            จัดการคำขอซ่อมบำรุงอุปกรณ์
          </p>
        </div>
        <Button asChild>
          <Link href="/account/maintenance/new">
            <Plus className="mr-2 h-4 w-4" />
            สร้างคำขอใหม่
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {groupedByStatus.map((group) => {
          const Icon = STATUS_ICONS[group.status as keyof typeof STATUS_ICONS];
          return (
            <Card key={group.status}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {group.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{group.requests.length}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด ({requests.length})</TabsTrigger>
          {groupedByStatus.map((group) => (
            <TabsTrigger key={group.status} value={group.status}>
              {group.label} ({group.requests.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>คำขอทั้งหมด</CardTitle>
              <CardDescription>
                รายการคำขอซ่อมบำรุงทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">ยังไม่มีคำขอซ่อมบำรุง</p>
                  <Button asChild className="mt-4">
                    <Link href="/account/maintenance/new">
                      สร้างคำขอใหม่
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>หัวข้อ</TableHead>
                      <TableHead>อุปกรณ์</TableHead>
                      <TableHead>ผู้ให้บริการ</TableHead>
                      <TableHead>วันที่สร้าง</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => {
                      const Icon = STATUS_ICONS[request.status as keyof typeof STATUS_ICONS];
                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {request.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.equipment ? (
                              <div>
                                <p className="font-medium">{request.equipment.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {request.equipment.category.nameTh}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {request.equipment?.provider ? (
                              request.equipment.provider.companyName
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatThaiDate(request.createdAt, "d MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                request.status === "RESOLVED"
                                  ? "default"
                                  : request.status === "IN_PROGRESS"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              <Icon className="mr-1 h-3 w-3" />
                              {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {groupedByStatus.map((group) => {
          const Icon = STATUS_ICONS[group.status as keyof typeof STATUS_ICONS];
          return (
            <TabsContent key={group.status} value={group.status}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {group.label}
                  </CardTitle>
                  <CardDescription>
                    คำขอที่มีสถานะ {group.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {group.requests.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        ไม่มีคำขอที่มีสถานะ {group.label}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>หัวข้อ</TableHead>
                          <TableHead>อุปกรณ์</TableHead>
                          <TableHead>ผู้ให้บริการ</TableHead>
                          <TableHead>วันที่สร้าง</TableHead>
                          {group.status === "RESOLVED" && <TableHead>วันที่แก้ไข</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {request.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.equipment ? (
                                <div>
                                  <p className="font-medium">{request.equipment.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {request.equipment.category.nameTh}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {request.equipment?.provider ? (
                                request.equipment.provider.companyName
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {formatThaiDate(request.createdAt, "d MMM yyyy")}
                            </TableCell>
                            {group.status === "RESOLVED" && (
                              <TableCell>
                                {request.resolvedAt
                                  ? formatThaiDate(request.resolvedAt, "d MMM yyyy")
                                  : "-"}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
