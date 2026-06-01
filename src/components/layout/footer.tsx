import Link from "next/link";
import { GraduationCap } from "lucide-react";

const footerLinks = {
  platform: [
    { href: "/equipment", label: "อุปกรณ์ทั้งหมด" },
    { href: "/providers", label: "ผู้ให้บริการ" },
    { href: "/blog", label: "บทความ" },
    { href: "/pricing", label: "ราคา" },
  ],
  company: [
    { href: "/about", label: "เกี่ยวกับเรา" },
    { href: "/contact", label: "ติดต่อเรา" },
    { href: "/careers", label: "ร่วมงานกับเรา" },
  ],
  legal: [
    { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
    { href: "/terms", label: "ข้อกำหนดการใช้งาน" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-brand text-brand-foreground">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-1 text-2xl font-extrabold tracking-tight mb-4"
            >
              <span>Spark</span>
              <span className="rounded-md bg-brand-foreground px-1.5 py-0.5 leading-none text-brand">
                Go
              </span>
            </Link>
            <p className="text-sm text-brand-foreground/85 max-w-xs">
              แพลตฟอร์มเช่าอุปกรณ์ทำโปรเจกต์ Raspberry Pi, Arduino, Micro:bit
              และเซนเซอร์ เริ่มต้นเพียง 10 บาท
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">แพลตฟอร์ม</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-foreground/85 hover:text-brand-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">บริษัท</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-foreground/85 hover:text-brand-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">กฎหมาย</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-foreground/85 hover:text-brand-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-foreground/20 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-brand-foreground/85">
            &copy; {new Date().getFullYear()} Spark Go. สงวนลิขสิทธิ์
          </p>
          <div className="flex flex-col items-center gap-1 md:items-end">
            <span className="text-sm text-brand-foreground/85">
              สร้างด้วยความรักเพื่อการศึกษาไทย
            </span>
            <span className="text-sm text-brand-foreground/85">
              ผลงานนี้พัฒนาภายใต้{" "}
              <Link
                href="https://jwc.in.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-foreground hover:underline"
              >
                JWC14 Camp
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
