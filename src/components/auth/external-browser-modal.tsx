"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, MoreVertical } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExternalBrowserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Name of the detected in-app browser, e.g. "LINE". */
  appName?: string;
}

/**
 * Shown when a user inside an in-app browser (LINE, Facebook, Instagram, …)
 * tries to sign in with Google. Google blocks OAuth in embedded webviews, so
 * we ask them to reopen the page in their device's real browser.
 */
export function ExternalBrowserModal({
  open,
  onOpenChange,
  appName,
}: ExternalBrowserModalProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success("คัดลอกลิงก์แล้ว");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกลิงก์ได้ กรุณาคัดลอกด้วยตนเอง");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เปิดในเบราว์เซอร์ภายนอก</DialogTitle>
          <DialogDescription>
            {appName ? (
              <>
                การเข้าสู่ระบบด้วย Google ไม่รองรับการใช้งานภายในแอป {appName}
              </>
            ) : (
              <>การเข้าสู่ระบบด้วย Google ไม่รองรับการใช้งานภายในแอปนี้</>
            )}{" "}
            กรุณาเปิดหน้านี้ในเบราว์เซอร์ของเครื่อง (เช่น Chrome หรือ Safari)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                1
              </span>
              <span className="flex flex-wrap items-center gap-1">
                แตะปุ่มเมนู
                <MoreVertical className="inline h-4 w-4" />
                ที่มุมของหน้าจอ
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                2
              </span>
              <span>เลือก &ldquo;เปิดในเบราว์เซอร์&rdquo; หรือ &ldquo;Open in Browser&rdquo;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                3
              </span>
              <span>เข้าสู่ระบบด้วย Google อีกครั้งในเบราว์เซอร์</span>
            </li>
          </ol>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              หรือคัดลอกลิงก์แล้วเปิดในเบราว์เซอร์ด้วยตนเอง
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-background px-2 py-1.5 text-xs">
                {currentUrl}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="คัดลอกลิงก์"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            asChild
          >
            <a href={currentUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              ลองเปิดในเบราว์เซอร์
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
