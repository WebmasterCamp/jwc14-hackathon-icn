"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  FileText,
  CreditCard,
  Wrench,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/account", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/account/quotations", label: "ใบเสนอราคา", icon: ReceiptText },
  { href: "/account/contracts", label: "สัญญา", icon: FileText },
  { href: "/account/payments", label: "การชำระเงิน", icon: CreditCard },
  { href: "/account/maintenance", label: "แจ้งซ่อม", icon: Wrench },
  { href: "/account/settings", label: "ตั้งค่า", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 border-b">
      {items.map((item) => {
        const isActive =
          item.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors -mb-px",
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
