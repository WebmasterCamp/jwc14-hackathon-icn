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
  Star,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const providerNavItems: SidebarItem[] = [
  { href: "/provider", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/provider/product", label: "อุปกรณ์", icon: Package },
  { href: "/provider/contracts", label: "สัญญา", icon: FileText },
  { href: "/provider/quotations", label: "ใบเสนอราคา", icon: ReceiptText },
  { href: "/provider/payments", label: "การชำระเงิน", icon: CreditCard },
  { href: "/provider/analytics", label: "วิเคราะห์", icon: BarChart3 },
  { href: "/provider/blog", label: "บทความ", icon: Newspaper },
  { href: "/provider/settings", label: "ตั้งค่า", icon: Settings },
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

function getVariantColor(variant: SidebarProps["variant"]) {
  switch (variant) {
    case "provider":
      return "text-secondary";
    case "admin":
      return "text-destructive";
    default:
      return "text-primary";
  }
}

/**
 * Renders the list of nav links. Shared by the desktop aside and the mobile drawer.
 * `collapsed` only applies on desktop (icon-only with tooltips); the mobile drawer
 * always renders expanded and calls `onNavigate` to dismiss itself on click.
 */
function SidebarNav({
  variant,
  collapsed = false,
  onNavigate,
}: {
  variant: SidebarProps["variant"];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navItems = variant === "provider" ? providerNavItems : adminNavItems;
  // Base/landing route per variant. Provider lives at /provider; admin at
  // /dashboard/admin. The base must be excluded from the startsWith() check so
  // it isn't marked active on every nested route.
  const baseHref = variant === "provider" ? "/provider" : "/dashboard/admin";

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== baseHref && pathname.startsWith(item.href));

        const linkContent = (
          <Link
            href={item.href}
            onClick={onNavigate}
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
                isActive && getVariantColor(variant)
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
  );
}

export function Sidebar({ variant }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-16 hidden h-[calc(100vh-4rem)] border-r bg-sidebar transition-all duration-300 md:flex md:flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex-1 py-4">
          <SidebarNav variant={variant} collapsed={collapsed} />
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

      {/* Mobile top bar + drawer trigger */}
      <div className="sticky top-16 z-30 flex items-center gap-2 border-b bg-background px-4 py-2 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Menu className="h-4 w-4" />
              <span>เมนู</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetHeader className="border-b px-4 py-4">
              <SheetTitle>เมนู</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <SidebarNav
                variant={variant}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
