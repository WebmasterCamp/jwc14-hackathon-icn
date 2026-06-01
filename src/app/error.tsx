"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for monitoring/debugging.
    console.error(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-brand-soft">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
            <AlertTriangle className="h-10 w-10 text-brand" />
          </div>

          <h1 className="text-2xl font-bold md:text-3xl">เกิดข้อผิดพลาดบางอย่าง</h1>
          <p className="mt-3 text-base text-foreground/70 md:text-lg">
            ขออภัย ระบบทำงานผิดพลาดชั่วคราว กรุณาลองใหม่อีกครั้ง
            หากยังพบปัญหาโปรดติดต่อทีมงานของเรา
          </p>

          {error.digest && (
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              รหัสอ้างอิง: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => reset()}
              size="lg"
              className="rounded-full bg-brand px-8 text-brand-foreground hover:bg-brand/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              ลองอีกครั้ง
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-foreground/20 px-8"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                กลับหน้าหลัก
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
