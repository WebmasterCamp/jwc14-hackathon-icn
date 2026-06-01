import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import {
  FileText,
  Building2,
  GraduationCap,
  Package,
  Calendar,
  DollarSign,
  Eye,
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
import { formatPrice, formatThaiDate } from "@/lib/format";

const STATUS_LABELS = {
  DRAFT: "ร่าง",
  PENDING_APPROVAL: "รออนุมัติ",
  ACTIVE: "ใช้งาน",
  SUSPENDED: "ระงับ",
  COMPLETED: "เสร็จสิ้น",
  TERMINATED: "ยกเลิก",
  CANCELLED: "ยกเลิก",
  OVERDUE: "เกินกำหนด",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PENDING_APPROVAL: "outline",
  ACTIVE: "default",
  SUSPENDED: "destructive",
  COMPLETED: "outline",
  TERMINATED: "destructive",
  CANCELLED: "secondary",
  OVERDUE: "destructive",
};

export default async function AdminContractsPage() {
  const contracts = await prisma.contract.findMany({
    include: {
      provider: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      customer: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      items: {
        include: {
          equipment: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          payments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const groupedByStatus = Object.keys(STATUS_LABELS).map((status) => ({
    status,
    label: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
    contracts: contracts.filter((c) => c.status === status),
  }));

  type ContractWithRelations = typeof contracts[number];

  const ContractTable = ({ contracts }: { contracts: ContractWithRelations[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>เลขที่สัญญา</TableHead>
          <TableHead>ผู้ให้บริการ</TableHead>
          <TableHead>สถานศึกษา</TableHead>
          <TableHead>อุปกรณ์</TableHead>
          <TableHead>ระยะเวลา</TableHead>
          <TableHead>มูลค่า</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract) => (
          <TableRow key={contract.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{contract.contractNumber}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{contract.provider.companyName}</p>
                  <p className="text-xs text-muted-foreground">
                    {contract.provider.province}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{contract.customer.schoolName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm">
                <Package className="h-3 w-3" />
                {contract.items.length} รายการ
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatThaiDate(contract.startDate, "d MMM yy")}
                </div>
                <div className="text-muted-foreground">
                  ถึง {formatThaiDate(contract.endDate, "d MMM yy")}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-medium">{formatPrice(contract.totalAmount)}</div>
                <div className="text-muted-foreground">
                  {formatPrice(contract.monthlyAmount)}/เดือน
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANTS[contract.status]}>
                {STATUS_LABELS[contract.status as keyof typeof STATUS_LABELS]}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/admin/contracts/${contract.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สัญญาทั้งหมด</h1>
        <p className="text-muted-foreground">
          จัดการสัญญาในระบบ
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              สัญญาทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
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
              {contracts.filter((c) => c.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รออนุมัติ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts.filter((c) => c.status === "PENDING_APPROVAL").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              มูลค่ารวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(
                contracts
                  .filter((c) => c.status === "ACTIVE")
                  .reduce((sum, c) => sum + c.totalAmount, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">ทั้งหมด ({contracts.length})</TabsTrigger>
          {groupedByStatus.map((group) => (
            <TabsTrigger key={group.status} value={group.status}>
              {group.label} ({group.contracts.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>สัญญาทั้งหมด</CardTitle>
              <CardDescription>
                รายการสัญญาทั้งหมดในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">ยังไม่มีสัญญาในระบบ</p>
                </div>
              ) : (
                <ContractTable contracts={contracts} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {groupedByStatus.map((group) => (
          <TabsContent key={group.status} value={group.status}>
            <Card>
              <CardHeader>
                <CardTitle>สัญญา{group.label}</CardTitle>
                <CardDescription>
                  รายการสัญญาที่มีสถานะ {group.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {group.contracts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      ไม่มีสัญญาที่มีสถานะ {group.label}
                    </p>
                  </div>
                ) : (
                  <ContractTable contracts={group.contracts} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
