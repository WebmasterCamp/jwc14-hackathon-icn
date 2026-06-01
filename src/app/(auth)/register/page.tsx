"use client";

import Link from "next/link";
import Image from "next/image";
import { School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto mb-2 flex justify-center">
          <Image
            src="/logo.png"
            alt="Spark Go"
            width={6000}
            height={3375}
            priority
            className="h-12 w-auto"
          />
        </div>
        <CardTitle className="text-2xl font-bold">สมัครสมาชิก</CardTitle>
        <CardDescription>
          เลือกประเภทบัญชีที่ตรงกับคุณ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Link href="/register/customer">
          <div className="p-6 border rounded-lg hover:border-primary hover:bg-accent transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <School className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">สถานศึกษา (Customer)</h3>
                <p className="text-muted-foreground text-sm">
                  สำหรับโรงเรียน วิทยาลัย หรือมหาวิทยาลัย
                  ที่ต้องการเช่าอุปกรณ์สำหรับการเรียนการสอน
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="pt-4 text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            เข้าสู่ระบบ
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
