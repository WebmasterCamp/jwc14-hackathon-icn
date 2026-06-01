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
  { href: "/categorise", label: "สินค้าทั้งหมด" },
  { href: "/how-to", label: "วิธีการสั่งซื้อ" },
  { href: "/blog", label: "บทความ" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!session?.user?.role) return "/dashboard/customer";
    switch (session.user.role) {
      case "ADMIN":
        return "/dashboard/admin";
      case "PROVIDER":
        return "/dashboard/provider";
      default:
        return "/dashboard/customer";
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Spark Go">
            <Image
              src="/logo.png"
              alt="Spark Go"
              width={6000}
              height={3375}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand",
                  pathname === item.href
                    ? "text-brand"
                    : "text-foreground/80"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <Button variant="ghost" size="icon" aria-label="ค้นหา" asChild>
              <Link href="/equipment">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {status === "loading" ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(session.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline max-w-[120px] truncate">
                      {session.user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4" />
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
                      แดชบอร์ด
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      โปรไฟล์
                    </Link>
                  </DropdownMenuItem>
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
                className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90"
              >
                <Link href="/sign-in">เข้าสู่ระบบ</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-brand/10 text-brand"
                      : "text-foreground/80 hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className="h-px bg-border my-2" />

              {session ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent"
                  >
                    แดชบอร์ด
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-full text-center text-sm font-medium bg-brand text-brand-foreground hover:bg-brand/90"
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
