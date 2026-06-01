import Link from "next/link";
import { LogIn, LayoutDashboard } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not signed in → show a login prompt instead of the account pages.
  if (!session?.user) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle>เข้าสู่ระบบเพื่อใช้งานบัญชีของคุณ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              คุณต้องเข้าสู่ระบบด้วยบัญชีผู้เช่า (ลูกค้า)
              เพื่อดูสัญญา ใบเสนอราคา การชำระเงิน และการแจ้งซ่อมของคุณ
            </p>
            <Button asChild className="w-full">
              <Link href="/login?callbackUrl=/account">
                <LogIn className="mr-2 h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signed in but not a customer (admin, or a USER with the is_provider flag)
  // → point them at their own dashboard instead of the customer /account area.
  if (session.user.role !== "USER" || session.user.isProvider) {
    const dashboard =
      session.user.role === "ADMIN"
        ? "/dashboard/admin"
        : "/provider";
    return (
      <div className="container mx-auto max-w-lg px-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle>พื้นที่นี้สำหรับบัญชีผู้เช่า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              บัญชีปัจจุบันของคุณไม่ใช่บัญชีผู้เช่า
              กรุณาไปที่แดชบอร์ดของคุณ
            </p>
            <Button asChild className="w-full">
              <Link href={dashboard}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                ไปที่แดชบอร์ด
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">บัญชีของฉัน</h1>
        <p className="text-muted-foreground">จัดการการเช่าและคำขอของคุณ</p>
      </div>
      <AccountNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
