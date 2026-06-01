import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';
import { FileText, MoreHorizontal, Eye, Download } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, formatThaiDate, formatContractDuration } from "@/lib/format";
import { ensureCustomerProfile } from "@/lib/queries";
import { differenceInMonths } from "date-fns";

const statusLabels: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  DRAFT: { label: "ร่าง", variant: "outline" },
  PENDING_APPROVAL: { label: "รอการอนุมัติ", variant: "secondary" },
  ACTIVE: { label: "ใช้งาน", variant: "default" },
  COMPLETED: { label: "สิ้นสุด", variant: "outline" },
  CANCELLED: { label: "ยกเลิก", variant: "destructive" },
  OVERDUE: { label: "เกินกำหนด", variant: "destructive" },
};

const typeLabels: Record<string, string> = {
  RENT: "เช่ารายเดือน",
  LEASE_TO_OWN: "เช่าซื้อ",
};

export default async function CustomerContractsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  // Guarantee the profile row exists so we never redirect-loop with middleware.
  await ensureCustomerProfile(session.user.id, session.user.name);

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    include: {
      contracts: {
        include: {
          provider: true,
          items: {
            include: {
              equipment: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) redirect("/sign-in");

  const activeContracts = customer.contracts.filter(
    (c) => c.status === "ACTIVE"
  );
  const pendingContracts = customer.contracts.filter(
    (c) => c.status === "PENDING_APPROVAL"
  );
  const completedContracts = customer.contracts.filter(
    (c) => c.status === "COMPLETED" || c.status === "CANCELLED"
  );

  const ContractTable = ({
    contracts,
  }: {
    contracts: typeof customer.contracts;
  }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>เลขที่สัญญา</TableHead>
          <TableHead>ผู้ให้บริการ</TableHead>
          <TableHead>ประเภท</TableHead>
          <TableHead>ระยะเวลา</TableHead>
          <TableHead>อุปกรณ์</TableHead>
          <TableHead>ค่าเช่า/เดือน</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contracts.map((contract) => {
          const duration = differenceInMonths(
            new Date(contract.endDate),
            new Date(contract.startDate)
          );
          return (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">
                {contract.contractNumber}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {contract.provider.companyName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contract.provider.province}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{typeLabels[contract.type]}</Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{formatContractDuration(duration)}</p>
                  <p className="text-muted-foreground">
                    ถึง {formatThaiDate(contract.endDate, "d MMM yy")}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {contract.items.reduce((sum, i) => sum + i.quantity, 0)} ชิ้น
              </TableCell>
              <TableCell>{formatPrice(contract.monthlyAmount)}</TableCell>
              <TableCell>
                <Badge variant={statusLabels[contract.status].variant}>
                  {statusLabels[contract.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/customer/contracts/${contract.id}`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        ดูรายละเอียด
                      </Link>
                    </DropdownMenuItem>
                    {contract.pdfUrl && (
                      <DropdownMenuItem asChild>
                        <a href={contract.pdfUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          ดาวน์โหลด PDF
                        </a>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">สัญญาของฉัน</h1>
        <p className="text-muted-foreground">
          ดูรายละเอียดสัญญาเช่าอุปกรณ์ทั้งหมด
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            ใช้งาน ({activeContracts.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            รอการอนุมัติ ({pendingContracts.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            สิ้นสุด ({completedContracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>สัญญาที่ใช้งาน</CardTitle>
              <CardDescription>
                สัญญาที่กำลังมีผลบังคับใช้
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    ยังไม่มีสัญญาที่ใช้งาน
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/customer/browse">
                      ค้นหาอุปกรณ์
                    </Link>
                  </Button>
                </div>
              ) : (
                <ContractTable contracts={activeContracts} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>สัญญารอการอนุมัติ</CardTitle>
              <CardDescription>
                สัญญาที่รอการยืนยันจากผู้ให้บริการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    ไม่มีสัญญารอการอนุมัติ
                  </p>
                </div>
              ) : (
                <ContractTable contracts={pendingContracts} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>สัญญาที่สิ้นสุด</CardTitle>
              <CardDescription>
                สัญญาที่หมดอายุหรือถูกยกเลิก
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedContracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    ไม่มีสัญญาที่สิ้นสุด
                  </p>
                </div>
              ) : (
                <ContractTable contracts={completedContracts} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
