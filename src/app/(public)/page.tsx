import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Bot,
  Printer,
  Zap,
  Settings,
  Plane,
  CheckCircle2,
  Building2,
  GraduationCap,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/structured-data";

const categories = [
  {
    icon: Cpu,
    name: "IoT",
    nameTh: "อุปกรณ์ IoT",
    description: "Arduino, Raspberry Pi และเซ็นเซอร์ต่างๆ",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Bot,
    name: "Robotics",
    nameTh: "หุ่นยนต์",
    description: "LEGO Education, VEX และชุดหุ่นยนต์",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Printer,
    name: "3D Printer",
    nameTh: "เครื่องพิมพ์ 3D",
    description: "FDM และ Resin Printer สำหรับการศึกษา",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Zap,
    name: "Laser Cutter",
    nameTh: "เครื่องตัดเลเซอร์",
    description: "เครื่องตัดและแกะสลักเลเซอร์",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Settings,
    name: "CNC",
    nameTh: "เครื่อง CNC",
    description: "เครื่องกัด CNC ขนาดเล็กสำหรับการเรียน",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Plane,
    name: "Drone",
    nameTh: "โดรน",
    description: "โดรนเพื่อการศึกษาและเขียนโปรแกรม",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: "ประหยัดงบประมาณ",
    description: "เช่าแทนซื้อ ลดค่าใช้จ่ายเริ่มต้นได้ถึง 70%",
  },
  {
    icon: Shield,
    title: "ไม่ต้องกังวลเรื่องซ่อมบำรุง",
    description: "มีทีมซ่อมบำรุงและเปลี่ยนอุปกรณ์เมื่อชำรุด",
  },
  {
    icon: CheckCircle2,
    title: "อัพเกรดได้ตลอด",
    description: "เปลี่ยนเป็นอุปกรณ์รุ่นใหม่เมื่อหมดสัญญา",
  },
];

const stats = [
  { value: "500+", label: "โรงเรียนที่ใช้บริการ" },
  { value: "50+", label: "ผู้ให้บริการ" },
  { value: "2,000+", label: "อุปกรณ์พร้อมให้เช่า" },
  { value: "77", label: "จังหวัดทั่วไทย" },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[generateOrganizationSchema(), generateWebSiteSchema()]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              แพลตฟอร์มสำหรับการศึกษาไทย
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              เช่าอุปกรณ์ <span className="text-primary">IoT & STEM</span>
              <br />
              สำหรับโรงเรียนไทย
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              เข้าถึงอุปกรณ์การเรียนรู้ที่ทันสมัยโดยไม่ต้องลงทุนซื้อ
              เริ่มต้นเช่าได้ตั้งแต่ 1,000 บาท/เดือน
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/equipment">
                  ค้นหาอุปกรณ์
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-up/provider">
                  <Building2 className="mr-2 h-5 w-5" />
                  สมัครเป็นผู้ให้บริการ
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              หมวดหมู่อุปกรณ์
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              อุปกรณ์ STEM และ IoT หลากหลายประเภท พร้อมให้เช่าสำหรับการเรียนการสอน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/equipment?category=${category.name.toLowerCase()}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      {category.nameTh}
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ทำไมต้องเช่ากับ Sparkgo?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ประโยชน์ที่โรงเรียนจะได้รับจากการเช่าอุปกรณ์แทนการซื้อ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center mb-3">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">สำหรับโรงเรียน</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    ค้นหาและเช่าอุปกรณ์สำหรับการเรียนการสอน STEM ในราคาประหยัด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link href="/sign-up/customer">
                      สมัครเป็นสถานศึกษา
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-secondary text-secondary-foreground">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-secondary-foreground/20 flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">สำหรับผู้ให้บริการ</CardTitle>
                  <CardDescription className="text-secondary-foreground/80">
                    ขยายตลาดและเข้าถึงโรงเรียนทั่วประเทศผ่านแพลตฟอร์มของเรา
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90"
                    asChild
                  >
                    <Link href="/sign-up/provider">
                      สมัครเป็นผู้ให้บริการ
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
