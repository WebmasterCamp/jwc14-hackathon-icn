'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const equipmentSchema = z.object({
  categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  name: z.string().min(2, 'กรุณากรอกชื่ออุปกรณ์'),
  nameTh: z.string().optional(),
  description: z.string().optional(),
  descriptionTh: z.string().optional(),
  rentPriceMonthly: z.coerce.number().positive('กรุณากรอกราคาเช่า'),
  leaseToOwnPrice: z.coerce.number().positive().optional(),
  leaseDuration: z.coerce.number().int().positive().optional(),
  depositAmount: z.coerce.number().nonnegative().default(0),
  stock: z.coerce.number().int().positive('กรุณากรอกจำนวนสต็อก'),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'FAIR']),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

interface EquipmentFormProps {
  categories: Array<{ id: string; name: string; nameTh: string }>;
  initialData?: Partial<EquipmentFormValues> & { id?: string };
}

export function EquipmentForm({ categories, initialData }: EquipmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || '',
      name: initialData?.name || '',
      nameTh: initialData?.nameTh || '',
      description: initialData?.description || '',
      descriptionTh: initialData?.descriptionTh || '',
      rentPriceMonthly: initialData?.rentPriceMonthly || 0,
      leaseToOwnPrice: initialData?.leaseToOwnPrice || undefined,
      leaseDuration: initialData?.leaseDuration || undefined,
      depositAmount: initialData?.depositAmount || 0,
      stock: initialData?.stock || 1,
      condition: initialData?.condition || 'NEW',
    },
  });

  async function onSubmit(data: EquipmentFormValues) {
    setIsLoading(true);
    try {
      const url = initialData?.id
        ? `/api/equipment/${initialData.id}`
        : '/api/equipment';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save equipment');
      }

      toast.success(
        initialData?.id ? 'อัพเดทอุปกรณ์เรียบร้อยแล้ว' : 'เพิ่มอุปกรณ์เรียบร้อยแล้ว'
      );
      router.push('/dashboard/provider/equipment');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หมวดหมู่ *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nameTh || category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่ออุปกรณ์ (EN) *</FormLabel>
                <FormControl>
                  <Input placeholder="3D Printer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nameTh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่ออุปกรณ์ (TH)</FormLabel>
                <FormControl>
                  <Input placeholder="เครื่องพิมพ์ 3 มิติ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>รายละเอียด (EN)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Equipment description..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descriptionTh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>รายละเอียด (TH)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="รายละเอียดอุปกรณ์..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="rentPriceMonthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ราคาเช่า/เดือน (บาท) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เงินมัดจำ (บาท)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>จำนวนสต็อก *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>สภาพอุปกรณ์ *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสภาพ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NEW">ใหม่</SelectItem>
                  <SelectItem value="EXCELLENT">ดีเยี่ยม</SelectItem>
                  <SelectItem value="GOOD">ดี</SelectItem>
                  <SelectItem value="FAIR">พอใช้</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'กำลังบันทึก...' : initialData?.id ? 'อัพเดท' : 'เพิ่มอุปกรณ์'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </Form>
  );
}
