import Link from "next/link";
import { Cpu, CircuitBoard, Cpu as Chip, Radio, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data";

const categories = [
  { label: "Raspberry Pi", icon: Cpu, query: "Raspberry Pi" },
  { label: "Arduino", icon: CircuitBoard, query: "Arduino" },
  { label: "Micro : bit", icon: Chip, query: "Micro:bit" },
  { label: "เซนเซอร์", icon: Radio, query: "เซนเซอร์" },
  { label: "ชุด Kit พร้อมใช้", icon: Boxes, query: "Kit" },
];

const projectExamples = [
  { title: "ระบบรดน้ำอัตโนมัติ", from: "from-emerald-200", to: "to-emerald-50" },
  { title: "เครื่องวัดอุณหภูมิ IoT", from: "from-sky-200", to: "to-sky-50" },
  { title: "หุ่นยนต์เดินตามเส้น", from: "from-amber-200", to: "to-amber-50" },
];

/** Centered section heading with the Figma cyan underline accent. */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-col items-center">
      <h2 className="text-2xl md:text-3xl font-bold text-center">{children}</h2>
      <span className="mt-3 h-1 w-16 rounded-full bg-brand" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={[generateOrganizationSchema(), generateWebSiteSchema()]} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-soft py-24 md:py-32">
        {/* Decorative floating boards (drop real photos at /public/hero-board-*.png) */}
        <div className="pointer-events-none absolute -left-16 top-16 hidden h-44 w-72 -rotate-12 rounded-2xl bg-gradient-to-br from-emerald-300/70 to-emerald-100/40 blur-[1px] md:block" />
        <div className="pointer-events-none absolute -right-16 top-12 hidden h-44 w-72 rotate-12 rounded-2xl bg-gradient-to-br from-sky-300/70 to-sky-100/40 blur-[1px] md:block" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              เช่าอุปกรณ์<span className="text-brand">ทำโปรเจกต์</span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl font-semibold text-foreground/80">
              เริ่มต้นเพียง 10 บาท
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
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
                <Link href="/how-to">เช่ายังไง</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading>หมวดหมู่สินค้า</SectionHeading>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={`/equipment?search=${encodeURIComponent(cat.query)}`}
                className="group flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-brand hover:text-brand"
              >
                <cat.icon className="h-4 w-4 text-brand" />
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Project Examples */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <SectionHeading>ตัวอย่างโปรเจกต์ลูกค้าเรา</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {projectExamples.map((p) => (
              <div
                key={p.title}
                className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
              >
                <div
                  className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${p.from} ${p.to}`}
                >
                  {/* cyan wave bottom (matches Figma) */}
                  <svg
                    className="absolute inset-x-0 bottom-0 h-10 w-full text-brand"
                    viewBox="0 0 400 40"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      fill="currentColor"
                      d="M0 20 C100 0 300 40 400 12 L400 40 L0 40 Z"
                    />
                  </svg>
                </div>
                <div className="p-4">
                  <p className="font-semibold">{p.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
