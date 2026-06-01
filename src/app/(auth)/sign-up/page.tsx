"use client";

import Link from "next/link";
import { GraduationCap, Building2, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
          <GraduationCap className="w-7 h-7 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">สมัครสมาชิก</CardTitle>
        <CardDescription>
          เลือกประเภทบัญชีที่ตรงกับคุณ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Link href="/sign-up/provider">
          <div className="p-6 border rounded-lg hover:border-primary hover:bg-accent transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Building2 className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">ผู้ให้บริการ (Provider)</h3>
                <p className="text-muted-foreground text-sm">
                  สำหรับบริษัทหรือผู้จัดจำหน่ายอุปกรณ์ STEM และ IoT
                  ที่ต้องการปล่อยเช่าอุปกรณ์ให้กับสถานศึกษา
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/sign-up/customer">
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
          <Link href="/sign-in" className="text-primary hover:underline font-medium">
            เข้าสู่ระบบ
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
