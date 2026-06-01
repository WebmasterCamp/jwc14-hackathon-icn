'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
import * as z from 'zod';
import { Search, Check, Package, X } from 'lucide-react';
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
import { toast } from 'react-hot-toast';

// Offering fields (always required) + new-product fields (only used when
// creating a brand-new catalog product rather than attaching to an existing one).
const equipmentSchema = z.object({
  // new-product fields (validated manually based on mode)
  categoryId: z.string().optional(),
  name: z.string().optional(),
  nameTh: z.string().optional(),
  description: z.string().optional(),
  descriptionTh: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  // offering fields
  rentPriceMonthly: z.coerce.number().positive('กรุณากรอกราคาเช่า'),
  leaseToOwnPrice: z.coerce.number().positive().optional(),
  leaseDuration: z.coerce.number().int().positive().optional(),
  depositAmount: z.coerce.number().nonnegative().default(0),
  stock: z.coerce.number().int().positive('กรุณากรอกจำนวนสต็อก'),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'FAIR']),
  insuranceMonths: z.coerce.number().int().nonnegative().optional(),
  conditions: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

interface LinkedProduct {
  id: string;
  name: string;
  nameTh?: string | null;
  category?: string | null;
  image?: string | null;
  offeringCount?: number;
}

interface EquipmentFormProps {
  categories: Array<{ id: string; name: string; nameTh: string }>;
  initialData?: Partial<EquipmentFormValues> & { id?: string };
  // When editing, the offering is already linked to a product (cannot change).
  linkedProduct?: LinkedProduct;
}

interface ProductSearchResult {
  id: string;
  name: string;
  nameTh: string | null;
  brand: string | null;
  model: string | null;
  image: string | null;
  category: string;
  offeringCount: number;
}

export function EquipmentForm({
  categories,
  initialData,
  linkedProduct,
}: EquipmentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);
  const [isLoading, setIsLoading] = useState(false);

  // Product selection: in edit mode it's fixed; in create mode the provider
  // either picks an existing catalog product or creates a new one.
  const [mode, setMode] = useState<'select' | 'new'>('select');
  const [selectedProduct, setSelectedProduct] = useState<LinkedProduct | null>(
    linkedProduct ?? null
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<EquipmentFormValues>({
    // zod v4 `coerce` makes the schema's input type diverge from its output,
    // which @hookform/resolvers v5 can't reconcile against a single useForm
    // generic — cast the resolver to the (output) form-values type.
    resolver: zodResolver(equipmentSchema) as unknown as Resolver<EquipmentFormValues>,
    defaultValues: {
      categoryId: initialData?.categoryId || '',
      name: initialData?.name || '',
      nameTh: initialData?.nameTh || '',
      description: initialData?.description || '',
      descriptionTh: initialData?.descriptionTh || '',
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      rentPriceMonthly: initialData?.rentPriceMonthly || 0,
      leaseToOwnPrice: initialData?.leaseToOwnPrice || undefined,
      leaseDuration: initialData?.leaseDuration || undefined,
      depositAmount: initialData?.depositAmount || 0,
      stock: initialData?.stock || 1,
      condition: initialData?.condition || 'NEW',
      insuranceMonths: initialData?.insuranceMonths || undefined,
      conditions: initialData?.conditions || '',
    },
  });

  // Debounced product search (create mode, "select existing" only).
  useEffect(() => {
    if (isEdit || mode !== 'select') return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products);
        }
      } catch {
        // ignore search errors
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, mode, isEdit]);

  async function onSubmit(data: EquipmentFormValues) {
    // Validate the product side based on the chosen mode.
    if (!isEdit) {
      if (mode === 'select' && !selectedProduct) {
        toast.error('กรุณาเลือกสินค้าจากรายการ หรือสร้างสินค้าใหม่');
        return;
      }
      if (mode === 'new') {
        if (!data.categoryId) {
          form.setError('categoryId', { message: 'กรุณาเลือกหมวดหมู่' });
          return;
        }
        if (!data.name || data.name.trim().length < 2) {
          form.setError('name', { message: 'กรุณากรอกชื่อสินค้า' });
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      const offering = {
        rentPriceMonthly: data.rentPriceMonthly,
        leaseToOwnPrice: data.leaseToOwnPrice,
        leaseDuration: data.leaseDuration,
        depositAmount: data.depositAmount,
        stock: data.stock,
        condition: data.condition,
        insuranceMonths: data.insuranceMonths,
        conditions: data.conditions || undefined,
      };

      let url: string;
      let method: 'POST' | 'PUT';
      let payload: Record<string, unknown>;

      if (isEdit) {
        url = `/api/equipment/${initialData!.id}`;
        method = 'PUT';
        // Edit only touches the offering's commercial terms.
        payload = offering;
      } else {
        url = '/api/equipment';
        method = 'POST';
        payload =
          mode === 'select'
            ? { productId: selectedProduct!.id, ...offering }
            : {
                newProduct: {
                  categoryId: data.categoryId,
                  name: data.name,
                  nameTh: data.nameTh || undefined,
                  description: data.description || undefined,
                  descriptionTh: data.descriptionTh || undefined,
                  brand: data.brand || undefined,
                  model: data.model || undefined,
                  images: [],
                },
                ...offering,
              };
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save equipment');
      }

      toast.success(
        isEdit ? 'อัพเดทรายการเรียบร้อยแล้ว' : 'เพิ่มรายการเรียบร้อยแล้ว'
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
        {/* ----- Product selection ----- */}
        <div className="rounded-lg border p-4 space-y-4">
          <div>
            <h3 className="font-semibold">สินค้า</h3>
            <p className="text-sm text-muted-foreground">
              เลือกสินค้าที่มีอยู่แล้วในระบบ
              เพื่อให้ลูกค้าเห็นร้านค้าของคุณรวมกับร้านอื่นที่ขายสินค้าเดียวกัน
              หรือสร้างสินค้าใหม่หากยังไม่มี
            </p>
          </div>

          {isEdit && selectedProduct ? (
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">
                  {selectedProduct.nameTh || selectedProduct.name}
                </p>
                {selectedProduct.category && (
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.category}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                ไม่สามารถเปลี่ยนสินค้าได้ในโหมดแก้ไข
              </span>
            </div>
          ) : (
            <>
              {/* mode toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('select')}
                >
                  เลือกสินค้าที่มีอยู่
                </Button>
                <Button
                  type="button"
                  variant={mode === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setMode('new');
                    setSelectedProduct(null);
                  }}
                >
                  สร้างสินค้าใหม่
                </Button>
              </div>

              {mode === 'select' &&
                (selectedProduct ? (
                  <div className="flex items-center gap-3 rounded-md border border-primary/40 bg-primary/5 p-3">
                    <Check className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">
                        {selectedProduct.nameTh || selectedProduct.name}
                      </p>
                      {typeof selectedProduct.offeringCount === 'number' && (
                        <p className="text-sm text-muted-foreground">
                          มี {selectedProduct.offeringCount} ร้านค้าที่ขายสินค้านี้
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedProduct(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="ค้นหาสินค้า เช่น ESP32, Arduino..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    {searching && (
                      <p className="text-sm text-muted-foreground">
                        กำลังค้นหา...
                      </p>
                    )}
                    {!searching &&
                      query.trim().length >= 2 &&
                      results.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          ไม่พบสินค้า — ลองสร้างสินค้าใหม่
                        </p>
                      )}
                    {results.length > 0 && (
                      <div className="rounded-md border divide-y">
                        {results.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50"
                            onClick={() => {
                              setSelectedProduct({
                                id: p.id,
                                name: p.name,
                                nameTh: p.nameTh,
                                category: p.category,
                                image: p.image,
                                offeringCount: p.offeringCount,
                              });
                              setResults([]);
                              setQuery('');
                            }}
                          >
                            <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">{p.nameTh || p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.category}
                                {p.offeringCount > 0 &&
                                  ` · ${p.offeringCount} ร้านค้า`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {mode === 'new' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมวดหมู่ *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                          <FormLabel>ชื่อสินค้า (EN) *</FormLabel>
                          <FormControl>
                            <Input placeholder="ESP32 DevKit" {...field} />
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
                          <FormLabel>ชื่อสินค้า (TH)</FormLabel>
                          <FormControl>
                            <Input placeholder="บอร์ด ESP32" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>แบรนด์</FormLabel>
                          <FormControl>
                            <Input placeholder="Espressif" {...field} />
                          </FormControl>
                          <FormDescription>
                            ช่วยให้ระบบจับคู่สินค้าซ้ำได้แม่นยำขึ้น
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>รุ่น</FormLabel>
                          <FormControl>
                            <Input placeholder="ESP32-DevKitC" {...field} />
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
                              placeholder="Product description..."
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
                              placeholder="รายละเอียดสินค้า..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ----- Offering (this shop's terms) ----- */}
        <div className="rounded-lg border p-4 space-y-4">
          <div>
            <h3 className="font-semibold">เงื่อนไขร้านค้าของคุณ</h3>
            <p className="text-sm text-muted-foreground">
              ราคาและเงื่อนไขเหล่านี้เป็นของร้านคุณโดยเฉพาะ
              และจะแสดงเทียบกับร้านอื่นที่ขายสินค้าเดียวกัน
            </p>
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

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="leaseToOwnPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาเช่าซื้อ (บาท)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="25000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="leaseDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ระยะเวลาเช่าซื้อ (เดือน)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สภาพอุปกรณ์ *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="insuranceMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ระยะเวลารับประกัน (เดือน)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="12" {...field} />
                  </FormControl>
                  <FormDescription>ประกัน/รับประกันของร้านคุณ</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เงื่อนไขการเช่า</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="เช่น ผู้เช่ารับผิดชอบค่าจัดส่งคืน, ต้องวางบัตรประชาชน..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  เงื่อนไขและข้อตกลงเฉพาะของร้านคุณ จะแสดงให้ลูกค้าเห็น
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'กำลังบันทึก...' : isEdit ? 'อัพเดท' : 'เพิ่มรายการ'}
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
