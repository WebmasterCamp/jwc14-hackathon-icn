"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * Reusable featured-image control using the presigned-R2 upload flow:
 *   POST /api/upload { filename, contentType, folder:"blog" } -> { uploadUrl, publicUrl }
 *   PUT the file to uploadUrl (progress via XHR), then store publicUrl.
 */
export function ImageUploadField({
  value,
  onChange,
  folder = "blog",
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  /** R2 destination folder (must be allowed by /api/upload). */
  folder?: "equipment" | "contracts" | "avatars" | "logos" | "blog" | "categories";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    setProgress(0);
    try {
      const presignRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || "ขอลิงก์อัปโหลดไม่สำเร็จ");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error("อัปโหลดไฟล์ไม่สำเร็จ"));
        xhr.onerror = () => reject(new Error("อัปโหลดไฟล์ไม่สำเร็จ"));
        xhr.send(file);
      });

      onChange(publicUrl);
      toast.success("อัปโหลดรูปภาพแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const uploading = progress !== null;

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
          <Image src={value} alt="Featured" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => onChange(undefined)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex aspect-video w-full max-w-md items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
          ยังไม่มีรูปภาพ
        </div>
      )}

      {uploading && <Progress value={progress ?? 0} className="max-w-md" />}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {value ? "เปลี่ยนรูปภาพ" : "อัปโหลดรูปภาพ"}
      </Button>
    </div>
  );
}
