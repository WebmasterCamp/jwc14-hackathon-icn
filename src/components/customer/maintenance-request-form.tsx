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

const maintenanceSchema = z.object({
  equipmentId: z.string().optional(),
  title: z.string().min(1, 'กรุณากรอกหัวข้อ'),
  description: z.string().min(10, 'กรุณากรอกรายละเอียดอย่างน้อย 10 ตัวอักษร'),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface MaintenanceRequestFormProps {
  equipment: Array<{
    id: string;
    name: string;
    category: { name: string; nameTh: string };
    provider: { companyName: string };
    contractNumber?: string;
    quantity?: number;
  }>;
}

export function MaintenanceRequestForm({ equipment }: MaintenanceRequestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      equipmentId: '',
      title: '',
      description: '',
    },
  });

  async function onSubmit(data: MaintenanceFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          equipmentId: data.equipmentId || undefined,
          images: [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create maintenance request');
      }

      toast.success('สร้างคำขอซ่อมบำรุงเรียบร้อยแล้ว');
      router.push('/dashboard/customer/maintenance');
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
          name="equipmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>อุปกรณ์ที่ต้องการแจ้งซ่อม *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกอุปกรณ์ที่มีปัญหา" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">ไม่ระบุอุปกรณ์ (คำขอทั่วไป)</SelectItem>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{eq.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {eq.category.nameTh} • {eq.provider.companyName}
                          {eq.contractNumber && ` • สัญญา: ${eq.contractNumber}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                เลือกอุปกรณ์ที่ต้องการซ่อมบำรุง หรือเว้นว่างไว้สำหรับคำขอทั่วไป
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>หัวข้อ *</FormLabel>
              <FormControl>
                <Input placeholder="เช่น: เครื่องพิมพ์ไม่ทำงาน" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รายละเอียด *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="อธิบายปัญหาหรือการซ่อมบำรุงที่ต้องการโดยละเอียด..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                กรุณาอธิบายปัญหาหรือการซ่อมบำรุงที่ต้องการให้ละเอียดที่สุด
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอ'}
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
