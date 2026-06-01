"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Users,
  Building2,
  Shield,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Newspaper,
  ReceiptText,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const providerNavItems: SidebarItem[] = [
  { href: "/dashboard/provider", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/dashboard/provider/equipment", label: "อุปกรณ์", icon: Package },
  { href: "/dashboard/provider/contracts", label: "สัญญา", icon: FileText },
  { href: "/dashboard/provider/quotations", label: "ใบเสนอราคา", icon: ReceiptText },
  { href: "/dashboard/provider/payments", label: "การชำระเงิน", icon: CreditCard },
  { href: "/dashboard/provider/analytics", label: "วิเคราะห์", icon: BarChart3 },
  { href: "/dashboard/provider/blog", label: "บทความ", icon: Newspaper },
  { href: "/dashboard/provider/settings", label: "ตั้งค่า", icon: Settings },
];

const adminNavItems: SidebarItem[] = [
  { href: "/dashboard/admin", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/dashboard/admin/providers", label: "ผู้ให้บริการ", icon: Building2 },
  { href: "/dashboard/admin/customers", label: "สถานศึกษา", icon: GraduationCap },
  { href: "/dashboard/admin/categories", label: "หมวดหมู่สินค้า", icon: Tag },
  { href: "/dashboard/admin/contracts", label: "สัญญาทั้งหมด", icon: FileText },
  { href: "/dashboard/admin/users", label: "ผู้ใช้", icon: Users },
  { href: "/dashboard/admin/blog", label: "บทความ", icon: Newspaper },
  { href: "/dashboard/admin/settings", label: "ตั้งค่าระบบ", icon: Shield },
];

interface SidebarProps {
  variant: "provider" | "admin";
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems =
    variant === "provider" ? providerNavItems : adminNavItems;

  const getVariantColor = () => {
    switch (variant) {
      case "provider":
        return "text-secondary";
      case "admin":
        return "text-destructive";
      default:
        return "text-primary";
    }
  };

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] border-r bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/dashboard/${variant}` &&
                pathname.startsWith(item.href));

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive && getVariantColor()
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </nav>
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>ย่อเมนู</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
