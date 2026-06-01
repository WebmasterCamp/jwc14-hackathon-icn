"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THAI_PROVINCES } from "@/constants/provinces";

const providerSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string(),
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
  companyName: z.string().min(2, "กรุณากรอกชื่อบริษัท/ร้านค้า"),
  taxId: z.string().optional(),
  address: z.string().min(5, "กรุณากรอกที่อยู่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  description: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

type ProviderForm = z.infer<typeof providerSchema>;

export default function ProviderSignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
  });

  const onSubmit = async (data: ProviderForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "เกิดข้อผิดพลาด");
        return;
      }

      toast.success("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
      router.push("/login");
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardHeader className="space-y-2">
        <div className="mb-2 flex justify-center">
          <Image
            src="/logo.png"
            alt="Spark Go"
            width={6098}
            height={1614}
            priority
            className="h-10 w-auto"
          />
        </div>
        <Link
          href="/register"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับ
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">สมัครเป็นผู้ให้บริการ</CardTitle>
            <CardDescription>กรอกข้อมูลบริษัท/ร้านค้าของคุณ</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">ข้อมูลผู้ติดต่อ</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                <Input
                  id="name"
                  placeholder="ชื่อ นามสกุล"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                <Input
                  id="phone"
                  placeholder="08X-XXX-XXXX"
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล *</Label>
              <Input
                id="email"
                type="email"
                placeholder="company@example.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">ข้อมูลบริษัท/ร้านค้า</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">ชื่อบริษัท/ร้านค้า *</Label>
                <Input
                  id="companyName"
                  placeholder="บริษัท xxx จำกัด"
                  {...register("companyName")}
                  disabled={isLoading}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                <Input
                  id="taxId"
                  placeholder="0-0000-00000-00-0"
                  {...register("taxId")}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">ที่อยู่ *</Label>
              <Textarea
                id="address"
                placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ"
                {...register("address")}
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">จังหวัด *</Label>
              <Select onValueChange={(value) => setValue("province", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent>
                  {THAI_PROVINCES.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.province && (
                <p className="text-sm text-destructive">{errors.province.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียดธุรกิจ</Label>
              <Textarea
                id="description"
                placeholder="อธิบายสินค้า/บริการของคุณโดยย่อ"
                {...register("description")}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            สมัครสมาชิก
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
