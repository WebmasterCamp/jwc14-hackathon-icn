"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { blogPostSchema, type BlogPostInput } from "@/lib/validations/blog";
import { MarkdownEditorField } from "./markdown-editor-field";
import { ImageUploadField } from "./image-upload-field";
import { Multiselect } from "./multiselect";

interface TaxonomyOption {
  id: string;
  name: string;
  nameTh?: string | null;
}

export interface PostFormInitialData extends Partial<BlogPostInput> {
  scheduledFor?: string;
}

export function PostForm({
  mode,
  basePath,
  categories,
  tags,
  initialData,
  currentSlug,
}: {
  mode: "create" | "edit";
  basePath: string;
  categories: TaxonomyOption[];
  tags: TaxonomyOption[];
  initialData?: PostFormInitialData;
  currentSlug?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // scheduledFor is kept out of the RHF schema because the schema validates it
  // as an ISO datetime while the <input> emits a `datetime-local` value; we
  // convert to ISO on submit.
  const [scheduledFor, setScheduledFor] = useState(initialData?.scheduledFor ?? "");

  const form = useForm<BlogPostInput>({
    // zod `.default()` makes input/output types diverge; cast the resolver to the
    // output form-values type (same pattern as equipment-form.tsx).
    resolver: zodResolver(blogPostSchema) as unknown as Resolver<BlogPostInput>,
    defaultValues: {
      title: initialData?.title || "",
      titleTh: initialData?.titleTh || "",
      content: initialData?.content || "",
      contentTh: initialData?.contentTh || "",
      excerpt: initialData?.excerpt || "",
      excerptTh: initialData?.excerptTh || "",
      featuredImage: initialData?.featuredImage || undefined,
      status: initialData?.status || "DRAFT",
      isFeatured: initialData?.isFeatured ?? false,
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      categoryIds: initialData?.categoryIds || [],
      tagIds: initialData?.tagIds || [],
    },
  });

  const status = form.watch("status");

  async function onSubmit(values: BlogPostInput) {
    setIsLoading(true);
    try {
      // Drop empty optional strings so URL/length validation on the server
      // doesn't choke on "".
      const clean = <T extends Record<string, unknown>>(obj: T) =>
        Object.fromEntries(
          Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined)
        );

      const payload: Record<string, unknown> = clean({
        ...values,
        tagIds: values.tagIds && values.tagIds.length ? values.tagIds : undefined,
      });

      if (values.status === "SCHEDULED" && scheduledFor) {
        payload.scheduledFor = new Date(scheduledFor).toISOString();
      } else {
        delete payload.scheduledFor;
      }

      const url =
        mode === "create"
          ? "/api/blog/posts"
          : `/api/blog/posts/${currentSlug}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "บันทึกไม่สำเร็จ");
      }

      toast.success(mode === "create" ? "สร้างบทความแล้ว" : "บันทึกบทความแล้ว");
      router.push(basePath);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.nameTh || c.name,
  }));
  const tagOptions = tags.map((t) => ({
    value: t.id,
    label: t.nameTh || t.name,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Titles */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อบทความ (อังกฤษ) *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Post title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="titleTh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อบทความ (ไทย)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="ชื่อบทความ" />
                </FormControl>
                <FormDescription>ใช้สร้าง slug ของบทความ</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Content editors */}
        <FormField
          control={form.control}
          name="contentTh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เนื้อหา (ไทย)</FormLabel>
              <FormControl>
                <MarkdownEditorField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="เขียนเนื้อหาภาษาไทย..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>เนื้อหา (อังกฤษ) *</FormLabel>
              <FormControl>
                <MarkdownEditorField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Write the English content..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excerpts */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="excerptTh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>สรุปย่อ (ไทย)</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={3} maxLength={500} />
                </FormControl>
                <FormDescription>เว้นว่างเพื่อสร้างอัตโนมัติ</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>สรุปย่อ (อังกฤษ)</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={3} maxLength={500} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Featured image */}
        <FormField
          control={form.control}
          name="featuredImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>รูปภาพหน้าปก</FormLabel>
              <FormControl>
                <ImageUploadField value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Taxonomy */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>หมวดหมู่ *</FormLabel>
                <FormControl>
                  <Multiselect
                    options={categoryOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="เลือกหมวดหมู่"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tagIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>แท็ก</FormLabel>
                <FormControl>
                  <Multiselect
                    options={tagOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="เลือกแท็ก"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status + featured */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>สถานะ</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">ฉบับร่าง</SelectItem>
                    <SelectItem value="SCHEDULED">ตั้งเวลาเผยแพร่</SelectItem>
                    <SelectItem value="PUBLISHED">เผยแพร่</SelectItem>
                    <SelectItem value="ARCHIVED">เก็บถาวร</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>บทความแนะนำ</FormLabel>
                  <FormDescription>แสดงในส่วนบทความแนะนำ</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {status === "SCHEDULED" && (
          <div className="max-w-sm">
            <label className="text-sm font-medium">เวลาที่จะเผยแพร่</label>
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="mt-2"
            />
          </div>
        )}

        {/* SEO */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta title</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} maxLength={60} />
                </FormControl>
                <FormDescription>{(field.value?.length ?? 0)}/60</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta description</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} rows={2} maxLength={160} />
                </FormControl>
                <FormDescription>{(field.value?.length ?? 0)}/160</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "กำลังบันทึก..." : mode === "create" ? "สร้างบทความ" : "บันทึก"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(basePath)}
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </Form>
  );
}
