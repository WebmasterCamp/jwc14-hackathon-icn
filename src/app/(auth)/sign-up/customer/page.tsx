"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, School, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { THAI_PROVINCES } from "@/constants/provinces";

const SCHOOL_TYPES = [
  { value: "PRIMARY", label: "ประถมศึกษา" },
  { value: "SECONDARY", label: "มัธยมศึกษาตอนต้น" },
  { value: "HIGH_SCHOOL", label: "มัธยมศึกษาตอนปลาย" },
  { value: "VOCATIONAL", label: "อาชีวศึกษา" },
  { value: "UNIVERSITY", label: "อุดมศึกษา" },
];

const customerSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string(),
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  phone: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง"),
  schoolName: z.string().min(2, "กรุณากรอกชื่อสถานศึกษา"),
  schoolType: z.string().min(1, "กรุณาเลือกประเภทสถานศึกษา"),
  address: z.string().min(5, "กรุณากรอกที่อยู่"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  studentCount: z.string().optional(),
  budget: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function CustomerSignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          studentCount: data.studentCount ? parseInt(data.studentCount) : undefined,
          budget: data.budget ? parseFloat(data.budget) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "เกิดข้อผิดพลาด");
        return;
      }

      toast.success("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
      router.push("/sign-in");
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg max-w-2xl mx-auto">
      <CardHeader className="space-y-2">
        <Link
          href="/sign-up"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          กลับ
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <School className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">สมัครเป็นสถานศึกษา</CardTitle>
            <CardDescription>กรอกข้อมูลสถานศึกษาของคุณ</CardDescription>
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
                placeholder="school@example.com"
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
            <h3 className="font-medium text-sm text-muted-foreground">ข้อมูลสถานศึกษา</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">ชื่อสถานศึกษา *</Label>
                <Input
                  id="schoolName"
                  placeholder="โรงเรียน xxx"
                  {...register("schoolName")}
                  disabled={isLoading}
                />
                {errors.schoolName && (
                  <p className="text-sm text-destructive">{errors.schoolName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolType">ประเภทสถานศึกษา *</Label>
                <Select onValueChange={(value) => setValue("schoolType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.schoolType && (
                  <p className="text-sm text-destructive">{errors.schoolType.message}</p>
                )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentCount">จำนวนนักเรียน</Label>
                <Input
                  id="studentCount"
                  type="number"
                  placeholder="เช่น 500"
                  {...register("studentCount")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">งบประมาณรายปี (บาท)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="เช่น 100000"
                  {...register("budget")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            สมัครสมาชิก
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
