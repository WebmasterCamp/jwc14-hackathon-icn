import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-brand-soft">
      {/* Decorative floating boards (match the homepage hero) */}
      <Image
        src="/assets/rasberrypi.png"
        alt=""
        aria-hidden
        width={300}
        height={230}
        className="pointer-events-none absolute -left-16 top-16 hidden w-[280px] -rotate-12 object-contain drop-shadow-xl md:block"
      />
      <Image
        src="/assets/arduino.png"
        alt=""
        aria-hidden
        width={300}
        height={230}
        className="pointer-events-none absolute -right-16 bottom-12 hidden w-[280px] rotate-12 object-contain drop-shadow-xl md:block"
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[7rem] font-extrabold leading-none tracking-tight text-brand md:text-[10rem]">
            404
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            ไม่พบหน้าที่คุณกำลังมองหา
          </h1>
          <p className="mt-3 text-base text-foreground/70 md:text-lg">
            หน้านี้อาจถูกย้าย ลบออกไป หรือไม่เคยมีอยู่
            ลองกลับไปหน้าหลักหรือเลือกดูอุปกรณ์ของเรา
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-brand px-8 text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                กลับหน้าหลัก
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-foreground/20 px-8"
            >
              <Link href="/product">
                <Search className="mr-2 h-4 w-4" />
                เลือกดูสินค้า
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
