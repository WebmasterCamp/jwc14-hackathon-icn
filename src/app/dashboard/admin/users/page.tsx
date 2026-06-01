import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Users, Shield, Building2, GraduationCap, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserActions } from "@/components/admin/user-actions";
import { formatThaiDate } from "@/lib/format";

type Role = "ADMIN" | "PROVIDER" | "CUSTOMER";

const ROLE_META: Record<
  Role,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  ADMIN: { label: "ผู้ดูแลระบบ", variant: "destructive" },
  PROVIDER: { label: "ผู้ให้บริการ", variant: "default" },
  CUSTOMER: { label: "สถานศึกษา", variant: "secondary" },
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const users = await prisma.user.findMany({
    include: {
      provider: { select: { companyName: true } },
      customer: { select: { schoolName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const providerCount = users.filter((u) => u.role === "PROVIDER").length;
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length;

  const UserTable = ({ rows }: { rows: typeof users }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ผู้ใช้</TableHead>
          <TableHead>ติดต่อ</TableHead>
          <TableHead>สิทธิ์</TableHead>
          <TableHead>วันที่สมัคร</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((u) => {
          const orgName =
            u.role === "PROVIDER"
              ? u.provider?.companyName
              : u.role === "CUSTOMER"
              ? u.customer?.schoolName
              : null;
          return (
            <TableRow key={u.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{u.name || "ไม่ระบุชื่อ"}</p>
                  {orgName && (
                    <p className="text-sm text-muted-foreground">{orgName}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {u.email}
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {u.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={ROLE_META[u.role as Role].variant}>
                  {ROLE_META[u.role as Role].label}
                </Badge>
              </TableCell>
              <TableCell>{formatThaiDate(u.createdAt, "d MMM yyyy")}</TableCell>
              <TableCell>
                <UserActions
                  userId={u.id}
                  userName={u.name || u.email}
                  currentRole={u.role as Role}
                  isSelf={u.id === session.user.id}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  const tabs: { value: string; label: string; rows: typeof users }[] = [
    { value: "all", label: `ทั้งหมด (${users.length})`, rows: users },
    {
      value: "ADMIN",
      label: `ผู้ดูแล (${adminCount})`,
      rows: users.filter((u) => u.role === "ADMIN"),
    },
    {
      value: "PROVIDER",
      label: `ผู้ให้บริการ (${providerCount})`,
      rows: users.filter((u) => u.role === "PROVIDER"),
    },
    {
      value: "CUSTOMER",
      label: `สถานศึกษา (${customerCount})`,
      rows: users.filter((u) => u.role === "CUSTOMER"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ผู้ใช้งาน</h1>
        <p className="text-muted-foreground">
          จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="ผู้ใช้ทั้งหมด" value={users.length} icon={Users} />
        <StatCard title="ผู้ดูแลระบบ" value={adminCount} icon={Shield} />
        <StatCard title="ผู้ให้บริการ" value={providerCount} icon={Building2} />
        <StatCard title="สถานศึกษา" value={customerCount} icon={GraduationCap} />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card>
              <CardHeader>
                <CardTitle>รายชื่อผู้ใช้</CardTitle>
              </CardHeader>
              <CardContent>
                {t.rows.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">ไม่มีผู้ใช้ในกลุ่มนี้</p>
                  </div>
                ) : (
                  <UserTable rows={t.rows} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
