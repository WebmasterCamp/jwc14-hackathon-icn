import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  FileText,
  CreditCard,
  Package,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { generateWebSiteSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  title: "วิธีการเช่าอุปกรณ์",
  description:
    "คู่มือการเช่าอุปกรณ์ IoT และ STEM จาก Spark Go - ขั้นตอนง่ายๆ เพียง 6 ขั้นตอน เริ่มต้นเพียง 10 บาท",
  alternates: { canonical: `${SITE_URL}/how-to` },
  openGraph: {
    title: "วิธีการเช่าอุปกรณ์ | Spark Go",
    description: "เรียนรู้วิธีการเช่าอุปกรณ์ทำโปรเจกต์ง่ายๆ ใน 6 ขั้นตอน",
    url: `${SITE_URL}/how-to`,
    type: "website",
  },
};

const steps = [
  {
    number: 1,
    icon: Search,
    title: "ค้นหาอุปกรณ์",
    description: "เลือกดูอุปกรณ์ที่ต้องการจากหมวดหมู่ต่างๆ หรือใช้ช่องค้นหา",
    color: "from-emerald-200 to-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    number: 2,
    icon: ShoppingCart,
    title: "เพิ่มลงตะกร้า",
    description: "เลือกระยะเวลาการเช่าและจำนวนที่ต้องการ จากนั้นเพิ่มลงตะกร้า",
    color: "from-sky-200 to-sky-50",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    number: 3,
    icon: FileText,
    title: "กรอกข้อมูล",
    description: "กรอกข้อมูลการจัดส่งและข้อมูลติดต่อให้ครบถ้วน",
    color: "from-purple-200 to-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    number: 4,
    icon: CreditCard,
    title: "ชำระเงิน",
    description: "ชำระค่าเช่าและค่าประกันผ่านช่องทางที่สะดวก",
    color: "from-amber-200 to-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    number: 5,
    icon: Package,
    title: "รับอุปกรณ์",
    description: "รอรับอุปกรณ์ตามที่อยู่ที่ระบุ หรือมารับด้วยตนเอง",
    color: "from-rose-200 to-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    number: 6,
    icon: RotateCcw,
    title: "คืนอุปกรณ์",
    description: "ส่งคืนอุปกรณ์เมื่อครบกำหนด รับเงินประกันคืนเต็มจำนวน",
    color: "from-cyan-200 to-cyan-50",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
];

const benefits = [
  {
    icon: CheckCircle2,
    title: "ไม่มีค่าใช้จ่ายแฝง",
    description: "ราคาชัดเจน โปร่งใส ไม่มีค่าธรรมเนียมซ่อนเร้น",
  },
  {
    icon: CheckCircle2,
    title: "ประกันคืนเต็มจำนวน",
    description: "คืนอุปกรณ์ในสภาพดี รับเงินประกันคืน 100%",
  },
  {
    icon: CheckCircle2,
    title: "ยืดหยุ่นระยะเวลา",
    description: "เช่าได้ตั้งแต่ 1 วัน ขยายเวลาได้ตามต้องการ",
  },
  {
    icon: CheckCircle2,
    title: "สนับสนุนตลอดเวลา",
    description: "ทีมงานพร้อมให้คำปรึกษาและช่วยเหลือทุกขั้นตอน",
  },
];

const faqs = [
  {
    q: "ระยะเวลาการเช่าขั้นต่ำคือเท่าไหร่?",
    a: "เราให้บริการเช่าขั้นต่ำ 1 วัน สามารถเลือกระยะเวลาได้ตามความต้องการของคุณ",
  },
  {
    q: "ค่าประกันคืนเมื่อไหร่?",
    a: "เงินประกันจะคืนภายใน 3-5 วันทำการ หลังจากตรวจสอบสภาพอุปกรณ์แล้ว",
  },
  {
    q: "ถ้าอุปกรณ์เสียระหว่างใช้งานต้องทำอย่างไร?",
    a: "แจ้งทีมงานทันที หากเป็นความเสียหายจากการใช้งานปกติ เราจะไม่เรียกเก็บค่าเสียหาย",
  },
  {
    q: "สามารถขยายเวลาการเช่าได้หรือไม่?",
    a: "ได้ครับ สามารถแจ้งขยายเวลาก่อนครบกำหนดส่งคืนอย่างน้อย 1 วัน",
  },
];

/** Centered section heading with the cyan underline accent. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col items-center">
      <h2 className="text-2xl md:text-3xl font-bold text-center">{children}</h2>
      <span className="mt-3 h-1 w-16 rounded-full bg-brand" />
    </div>
  );
}

export default function HowToPage() {
  return (
    <>
      <JsonLd
        data={[
          generateWebSiteSchema(),
          generateBreadcrumbSchema([
            { name: "หน้าแรก", url: "/" },
            { name: "วิธีการเช่า", url: "/how-to" },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-soft py-16 md:py-24">
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              วิธีการเช่าอุปกรณ์
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80">
              ง่ายๆ เพียง 6 ขั้นตอน เริ่มต้นทำโปรเจกต์ของคุณได้ทันที
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading>ขั้นตอนการเช่า</SectionHeading>

          <div className="max-w-5xl mx-auto space-y-8">
            {steps.map((step, idx) => (
              <div
                key={step.number}
                className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className={`relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color}`}
                    >
                      <step.icon className="h-10 w-10 text-foreground/80" />
                      <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground text-sm font-bold">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Arrow (desktop only) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Decorative wave */}
                <svg
                  className="absolute inset-x-0 bottom-0 h-6 w-full text-brand/5"
                  viewBox="0 0 400 24"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M0 12 C100 0 300 24 400 8 L400 24 L0 24 Z"
                  />
                </svg>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-brand px-8 text-brand-foreground hover:bg-brand/90"
            >
              <Link href="/equipment">เริ่มเลือกอุปกรณ์เลย</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-brand-soft">
        <div className="container mx-auto px-4">
          <SectionHeading>ทำไมต้องเช่ากับเรา</SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
                  <benefit.icon className="h-7 w-7 text-brand" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading>คำถามที่พบบ่อย</SectionHeading>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                    Q
                  </span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-muted-foreground ml-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-brand-soft">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              พร้อมเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              เลือกอุปกรณ์ที่ต้องการและเริ่มทำโปรเจกต์ของคุณได้เลยวันนี้
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-brand px-8 text-brand-foreground hover:bg-brand/90"
              >
                <Link href="/equipment">เลือกดูสินค้า</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-foreground/20 px-8"
              >
                <Link href="/contact">ติดต่อสอบถาม</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
