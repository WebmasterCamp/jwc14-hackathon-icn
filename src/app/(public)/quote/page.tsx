import Link from "next/link";
import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCustomerProfile } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteReviewClient } from "@/components/quote/quote-review-client";

export const metadata: Metadata = {
  title: "ออกใบเสนอราคา",
  robots: { index: false },
};

export default async function QuotePage() {
  const session = await auth();

  // Issuing a quotation requires a signed-in CUSTOMER.
  if (!session?.user || session.user.role !== "USER") {
    return (
      <div className="container mx-auto max-w-lg px-4 py-20">
        <Card>
          <CardHeader>
            <CardTitle>เข้าสู่ระบบเพื่อออกใบเสนอราคา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              คุณต้องเข้าสู่ระบบด้วยบัญชีผู้เช่า (ลูกค้า)
              เพื่อบันทึกและส่งใบเสนอราคาให้ผู้ให้บริการ
            </p>
            <Button asChild className="w-full">
              <Link href={`/login?callbackUrl=/quote`}>
                <LogIn className="mr-2 h-4 w-4" />
                เข้าสู่ระบบ
              </Link>
            </Button>
            {session?.user && session.user.role !== "USER" && (
              <p className="text-sm text-muted-foreground">
                บัญชีปัจจุบันไม่ใช่บัญชีผู้เช่า กรุณาเข้าสู่ระบบด้วยบัญชีลูกค้า
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prefill contact details from the customer profile.
  const [user, customer] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    }),
    ensureCustomerProfile(session.user.id, session.user.name),
  ]);

  const prefill = {
    contactName: user?.name ?? "",
    contactEmail: user?.email ?? "",
    contactPhone: user?.phone ?? "",
    organization: customer?.schoolName ?? "",
    billingAddress: customer?.address ?? "",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <QuoteReviewClient prefill={prefill} />
    </div>
  );
}
