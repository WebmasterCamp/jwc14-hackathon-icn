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
import { motion, AnimatePresence } from "framer-motion";

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
import { QuoteCartSheet } from "@/components/quote/quote-cart-sheet";

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

  // ADMIN = staff (operator console). is_provider users get the provider console
  // at /provider. Everyone else is a customer using /account.
  const isStaff = session?.user?.role === "ADMIN";
  const isProvider = !isStaff && !!session?.user?.isProvider;
  const getDashboardLink = () =>
    isStaff ? "/dashboard/admin" : isProvider ? "/provider" : "/account";
  const dashboardLabel = isStaff
    ? "แดชบอร์ด"
    : isProvider
    ? "แดชบอร์ดผู้ให้บริการ"
    : "บัญชีของฉัน";

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background shadow-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Spark Go">
            <Image
              src="/logo.png"
              alt="Spark Go"
              width={6098}
              height={1614}
              priority
              className="h-10 w-auto md:h-12"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[15px] font-medium transition-colors hover:text-brand",
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
              <Link href="/product">
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
                      {dashboardLabel}
                    </Link>
                  </DropdownMenuItem>
                  {!isStaff && !isProvider && (
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
                className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90"
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
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={isMobileMenuOpen ? "close" : "open"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                {isMobileMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t-2"
            >
              <nav className="flex flex-col gap-1.5 py-4">
                {publicNavItems.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.08 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-semibold transition-colors",
                        pathname === item.href
                          ? "bg-brand/10 text-brand border-l-4 border-brand"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="h-px bg-border my-2" />

                {session ? (
                  <>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-4 py-3 text-base font-semibold text-muted-foreground hover:bg-accent"
                    >
                      {dashboardLabel}
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="rounded-lg px-4 py-3 text-base font-semibold text-destructive hover:bg-destructive/10 text-left"
                    >
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full px-4 py-3 text-center text-base font-bold bg-brand text-brand-foreground hover:bg-brand/90 shadow-md"
                  >
                    เข้าสู่ระบบ
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
