import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import {
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, formatThaiDate } from "@/lib/format";

const SCHOOL_TYPE_LABELS = {
  PRIMARY: "ประถมศึกษา",
  SECONDARY: "มัธยมต้น",
  HIGH_SCHOOL: "มัธยมปลาย",
  VOCATIONAL: "อาชีวศึกษา",
  UNIVERSITY: "อุดมศึกษา",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ schoolType?: string; search?: string }>;
}) {
  const params = await searchParams;
  const schoolTypeFilter = params.schoolType;
  const searchQuery = params.search;

  const where: any = {};

  if (schoolTypeFilter) {
    where.schoolType = schoolTypeFilter;
  }

  if (searchQuery) {
    where.OR = [
      { schoolName: { contains: searchQuery, mode: "insensitive" as const } },
      { province: { contains: searchQuery, mode: "insensitive" as const } },
      { user: { email: { contains: searchQuery, mode: "insensitive" as const } } },
    ];
  }

  const [customers, totalSpending] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            contracts: true,
          },
        },
        contracts: {
          where: {
            status: "ACTIVE",
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.aggregate({
      where: {
        status: "PAID",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  // Calculate spending per customer
  const customersWithSpending = await Promise.all(
    customers.map(async (customer) => {
      const spending = await prisma.payment.aggregate({
        where: {
          status: "PAID",
          contract: {
            customerId: customer.id,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        ...customer,
        totalSpent: spending._sum.amount || 0,
      };
    })
  );

  const groupedByType = Object.entries(SCHOOL_TYPE_LABELS).map(([type, label]) => ({
    type,
    label,
    count: customers.filter((c) => c.schoolType === type).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สถานศึกษาทั้งหมด</h1>
        <p className="text-muted-foreground">
          จัดการสถานศึกษาในระบบ
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              สถานศึกษาทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              สัญญาที่ใช้งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.reduce((sum, c) => sum + c.contracts.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายจ่ายรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(totalSpending._sum.amount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ค่าเฉลี่ยต่อสถานศึกษา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(
                customers.length > 0
                  ? (totalSpending._sum.amount || 0) / customers.length
                  : 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>กรองข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="ค้นหาชื่อสถานศึกษา, จังหวัด, อีเมล..." />
            </div>
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="ประเภทสถานศึกษา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {Object.entries(SCHOOL_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* School Type Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">ทั้งหมด ({customers.length})</TabsTrigger>
          {groupedByType.map((group) => (
            <TabsTrigger key={group.type} value={group.type}>
              {group.label} ({group.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>สถานศึกษาทั้งหมด</CardTitle>
              <CardDescription>
                รายการสถานศึกษาที่ลงทะเบียนในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>สถานศึกษา</TableHead>
                    <TableHead>ติดต่อ</TableHead>
                    <TableHead>จังหวัด</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>สัญญาที่ใช้งาน</TableHead>
                    <TableHead>รายจ่ายรวม</TableHead>
                    <TableHead>วันที่สมัคร</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersWithSpending.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.schoolName}</p>
                            {customer.studentCount && (
                              <p className="text-xs text-muted-foreground">
                                {customer.studentCount.toLocaleString()} นักเรียน
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.user.email}
                          </div>
                          {customer.user.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {customer.user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {customer.province || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {SCHOOL_TYPE_LABELS[customer.schoolType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="h-3 w-3" />
                          {customer.contracts.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="h-3 w-3" />
                          {formatPrice(customer.totalSpent)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatThaiDate(customer.user.createdAt, "d MMM yy")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {groupedByType.map((group) => (
          <TabsContent key={group.type} value={group.type}>
            <Card>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
                <CardDescription>
                  สถานศึกษาประเภท{group.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>สถานศึกษา</TableHead>
                      <TableHead>ติดต่อ</TableHead>
                      <TableHead>จังหวัด</TableHead>
                      <TableHead>สัญญาที่ใช้งาน</TableHead>
                      <TableHead>รายจ่ายรวม</TableHead>
                      <TableHead>วันที่สมัคร</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersWithSpending
                      .filter((c) => c.schoolType === group.type)
                      .map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{customer.schoolName}</p>
                                {customer.studentCount && (
                                  <p className="text-xs text-muted-foreground">
                                    {customer.studentCount.toLocaleString()} นักเรียน
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customer.user.email}
                              </div>
                              {customer.user.phone && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {customer.user.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {customer.province || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <FileText className="h-3 w-3" />
                              {customer.contracts.length}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(customer.totalSpent)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {formatThaiDate(customer.user.createdAt, "d MMM yy")}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
