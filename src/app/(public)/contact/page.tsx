import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JsonLd } from "@/components/seo/json-ld";
import { generateWebSiteSchema, generateBreadcrumbSchema } from "@/lib/structured-data";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description:
    "ติดต่อ Spark Go - แพลตฟอร์มเช่าอุปกรณ์ทำโปรเจกต์ Raspberry Pi, Arduino, Micro:bit และเซนเซอร์",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "ติดต่อเรา | Spark Go",
    description: "ติดต่อ Spark Go สอบถามข้อมูลเกี่ยวกับการเช่าอุปกรณ์ทำโปรเจกต์",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
};

const contactInfo = [
  {
    icon: Mail,
    label: "อีเมล",
    value: "contact@sparkgo.co.th",
    href: "mailto:contact@sparkgo.co.th",
  },
  {
    icon: Phone,
    label: "โทรศัพท์",
    value: "02-XXX-XXXX",
    href: "tel:02XXXXXXX",
  },
  {
    icon: MapPin,
    label: "ที่อยู่",
    value: "กรุงเทพมหานคร ประเทศไทย",
    href: null,
  },
  {
    icon: Clock,
    label: "เวลาทำการ",
    value: "จันทร์-ศุกร์ 9:00-18:00 น.",
    href: null,
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

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          generateWebSiteSchema(),
          generateBreadcrumbSchema([
            { name: "หน้าแรก", url: "/" },
            { name: "ติดต่อเรา", url: "/contact" },
          ]),
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-soft py-16 md:py-24">
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              ติดต่อเรา
            </h1>
            <p className="mt-4 text-lg md:text-xl text-foreground/80">
              มีคำถามหรือต้องการความช่วยเหลือ? เราพร้อมให้บริการคุณ
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info) => {
              const content = (
                <div className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
                    <info.icon className="h-7 w-7 text-brand" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{info.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{info.value}</p>
                </div>
              );

              return info.href ? (
                <a
                  key={info.label}
                  href={info.href}
                  className="group transition-transform hover:scale-105"
                >
                  {content}
                </a>
              ) : (
                <div key={info.label}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-brand-soft">
        <div className="container mx-auto px-4">
          <SectionHeading>ส่งข้อความถึงเรา</SectionHeading>

          <div className="max-w-2xl mx-auto">
            <form className="space-y-6 rounded-2xl border bg-card p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    ชื่อ-นามสกุล <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="กรอกชื่อของคุณ"
                    required
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    อีเมล <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  เบอร์โทรศัพท์
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0XX-XXX-XXXX"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  หัวข้อ <span className="text-destructive">*</span>
                </label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="เรื่องที่ต้องการติดต่อ"
                  required
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  ข้อความ <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="รายละเอียดที่ต้องการสอบถาม..."
                  required
                  rows={6}
                  className="rounded-lg resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90 gap-2"
              >
                <Send className="h-5 w-5" />
                ส่งข้อความ
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeading>คำถามที่พบบ่อย</SectionHeading>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "ระยะเวลาการเช่าขั้นต่ำคือเท่าไหร่?",
                a: "เราให้บริการเช่าขั้นต่ำ 1 วัน สามารถเลือกระยะเวลาได้ตามความต้องการของคุณ",
              },
              {
                q: "มีการประกันอุปกรณ์หรือไม่?",
                a: "ทุกการเช่าจะมีการวางมัดจำเพื่อเป็นประกันอุปกรณ์ โดยจะคืนเต็มจำนวนเมื่อส่งคืนอุปกรณ์ในสภาพสมบูรณ์",
              },
              {
                q: "สามารถขอคำแนะนำในการเลือกอุปกรณ์ได้หรือไม่?",
                a: "ได้เลยครับ! เรามีผู้ช่วย AI และทีมงานที่พร้อมให้คำแนะนำเกี่ยวกับอุปกรณ์ที่เหมาะสมกับโปรเจกต์ของคุณ",
              },
              {
                q: "มีบริการจัดส่งหรือไม่?",
                a: "มีครับ เรามีบริการจัดส่งทั่วประเทศไทย ค่าจัดส่งขึ้นอยู่กับระยะทางและน้ำหนักของอุปกรณ์",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
