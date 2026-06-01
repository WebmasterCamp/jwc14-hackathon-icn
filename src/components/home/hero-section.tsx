"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Float } from "@/components/motion/float";

/** Circular board cards that bob beside the laptop (PNGs already include the ring). */
const boardCards = [
  { src: "/assets/heropop1.png", alt: "Raspberry Pi", size: 132, float: { y: 14, rotate: 4, duration: 4.2, delay: 0 } },
  { src: "/assets/heropop2.png", alt: "micro:bit", size: 104, float: { y: 11, rotate: 5, duration: 3.4, delay: 0.6 } },
  { src: "/assets/heropop3.png", alt: "Arduino", size: 150, float: { y: 16, rotate: 3, duration: 5, delay: 1.1 } },
];

function HeroButtons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        asChild
        size="lg"
        className="rounded-full bg-brand px-8 text-base font-bold text-brand-foreground shadow-md hover:bg-brand/90"
      >
        <Link href="/product">เลือกดูสินค้า</Link>
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="rounded-full border-foreground/15 bg-card px-8 text-base font-bold shadow-sm"
      >
        <Link href="/contact">ติดต่อเรา</Link>
      </Button>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-soft">
      {/* Faint tech-doodle background, slowly drifting */}
      <Float className="absolute inset-0" y={10} x={10} duration={16}>
        <Image
          src="/assets/hero-bg.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover opacity-70"
        />
      </Float>

      {/* ───────────────── Desktop composition (3 zones) ───────────────── */}
      <div className="container relative mx-auto hidden h-[640px] px-4 lg:block">
        {/* Left text */}
        <div className="absolute left-2 top-[20%] z-20 max-w-sm">
          <h1 className="text-6xl font-extrabold leading-none tracking-tight text-brand">
            ไม่ต้องซื้อ
          </h1>
          <p className="mt-3 text-2xl italic text-foreground/70">
            Spark Ideas, Go Innovate
          </p>
          <div className="mt-6">
            <HeroButtons />
          </div>
        </div>

        {/* Right text */}
        <h2 className="absolute right-6 top-[24%] z-20 text-6xl font-extrabold tracking-tight text-foreground">
          ก็เรียนรู้ได้
        </h2>

        {/* Student illustration, centered & anchored to the bottom */}
        <Float
          className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2"
          y={8}
          duration={6}
        >
          <Image
            src="/assets/hero-human.png"
            alt="นักเรียนกำลังใช้แล็ปท็อปเรียนรู้"
            width={560}
            height={640}
            priority
            className="h-[600px] w-auto object-contain"
          />
        </Float>

        {/* Floating board cards, clustered to the right of the laptop */}
        <Float className="absolute right-[14%] top-[34%] z-20" {...boardCards[0].float}>
          <Image src={boardCards[0].src} alt={boardCards[0].alt} width={boardCards[0].size} height={boardCards[0].size} className="drop-shadow-xl" />
        </Float>
        <Float className="absolute right-[7%] top-[46%] z-20" {...boardCards[1].float}>
          <Image src={boardCards[1].src} alt={boardCards[1].alt} width={boardCards[1].size} height={boardCards[1].size} className="drop-shadow-xl" />
        </Float>
        <Float className="absolute right-[2%] top-[36%] z-20" {...boardCards[2].float}>
          <Image src={boardCards[2].src} alt={boardCards[2].alt} width={boardCards[2].size} height={boardCards[2].size} className="drop-shadow-xl" />
        </Float>

        {/* Decorative cyan shapes */}
        <Float className="absolute bottom-[20%] left-[20%] z-20" y={9} duration={4.5} delay={0.3}>
          <span className="block h-16 w-16 rounded-full border-[6px] border-brand/80" />
        </Float>
        <Float className="absolute bottom-[14%] left-[27%] z-20" y={7} duration={3.6} delay={0.9}>
          <span className="block h-8 w-8 rounded-full border-4 border-brand/70" />
        </Float>
        <Float className="absolute bottom-[20%] right-[16%] z-20 flex flex-col items-end gap-1.5" y={6} duration={4} delay={0.5}>
          <span className="block h-1.5 w-10 rounded-full bg-brand/80" />
          <span className="block h-1.5 w-7 rounded-full bg-brand/60" />
          <span className="block h-1.5 w-5 rounded-full bg-brand/50" />
        </Float>
      </div>

      {/* ───────────────── Mobile / tablet stack ───────────────── */}
      <div className="container relative z-10 mx-auto flex flex-col items-center px-4 py-14 text-center lg:hidden">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          <span className="text-brand">ไม่ต้องซื้อ</span> ก็เรียนรู้ได้
        </h1>
        <p className="mt-2 text-lg italic text-foreground/70 sm:text-xl">
          Spark Ideas, Go Innovate
        </p>

        <div className="relative mt-6">
          <Float className="absolute -left-4 top-6 z-20" {...boardCards[0].float}>
            <Image src={boardCards[0].src} alt={boardCards[0].alt} width={84} height={84} className="drop-shadow-xl" />
          </Float>
          <Float className="absolute -right-2 top-24 z-20" {...boardCards[2].float}>
            <Image src={boardCards[2].src} alt={boardCards[2].alt} width={92} height={92} className="drop-shadow-xl" />
          </Float>
          <Float y={6} duration={6}>
            <Image
              src="/assets/hero-human.png"
              alt="นักเรียนกำลังใช้แล็ปท็อปเรียนรู้"
              width={420}
              height={480}
              priority
              className="h-[360px] w-auto object-contain sm:h-[440px]"
            />
          </Float>
        </div>

        <div className="mt-6 flex justify-center">
          <HeroButtons />
        </div>
      </div>
    </section>
  );
}
