"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  Search,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const publicNavItems = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/category", label: "สินค้าทั้งหมด" },
  { href: "/how-to", label: "วิธีการสั่งซื้อ" },
  { href: "/blog", label: "บทความ" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Customers live in the public /account area; staff have role dashboards.
  const isStaff =
    session?.user?.role === "ADMIN" || session?.user?.role === "ADMIN";
  const getDashboardLink = () => {
    switch (session?.user?.role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "PROVIDER":
        return "/dashboard/provider";
      default:
        return "/account";
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-border bg-background shadow-md">
      <div className="container mx-auto px-6">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Spark Go">
            <Image
              src="/logo.png"
              alt="Spark Go"
              width={6000}
              height={3375}
              priority
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-lg font-bold transition-colors hover:text-brand py-2 px-2 hover:scale-105 transition-transform",
                  pathname === item.href
                    ? "text-brand border-b-[3px] border-brand"
                    : "text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search */}
            <Button variant="ghost" size="lg" aria-label="ค้นหา" asChild className="h-12 w-12">
              <Link href="/equipment">
                <Search className="h-7 w-7" />
              </Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-12 w-12"
            >
              <Sun className="h-7 w-7 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-7 w-7 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {status === "loading" ? (
              <div className="h-12 w-28 bg-muted animate-pulse rounded-md" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-12 text-lg font-bold">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                        {getInitials(session.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline max-w-[120px] truncate font-bold">
                      {session.user?.name}
                    </span>
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {isStaff ? "แดชบอร์ด" : "บัญชีของฉัน"}
                    </Link>
                  </DropdownMenuItem>
                  {!isStaff && (
                    <DropdownMenuItem asChild>
                      <Link href="/account/settings">
                        <User className="mr-2 h-4 w-4" />
                        ตั้งค่าโปรไฟล์
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="lg"
                className="rounded-full bg-brand px-10 py-6 text-lg font-bold text-brand-foreground hover:bg-brand/90 shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/login">เข้าสู่ระบบ</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="lg"
            className="md:hidden h-12 w-12"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7" />
            ) : (
              <Menu className="h-7 w-7" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t-2">
            <nav className="flex flex-col gap-3">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-5 py-4 rounded-lg text-lg font-bold transition-colors",
                    pathname === item.href
                      ? "bg-brand/10 text-brand border-l-4 border-brand"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-border my-3" />

              {session ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-5 py-4 rounded-lg text-lg font-bold text-muted-foreground hover:bg-accent"
                  >
                    {isStaff ? "แดชบอร์ด" : "บัญชีของฉัน"}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="px-5 py-4 rounded-lg text-lg font-bold text-destructive hover:bg-destructive/10 text-left"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-4 rounded-full text-center text-lg font-bold bg-brand text-brand-foreground hover:bg-brand/90 shadow-md"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
