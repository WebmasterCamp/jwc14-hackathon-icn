"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

/**
 * Floating action button that links to the AI assistant page.
 * Rendered globally from the public layout; hidden on /ask itself.
 */
export function AskLauncher() {
  const pathname = usePathname();
  if (pathname?.startsWith("/ask")) return null;

  return (
    <Link
      href="/ask"
      aria-label="ถามผู้ช่วย AI"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-brand-foreground shadow-lg transition-transform hover:scale-105 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">ถามผู้ช่วย AI</span>
    </Link>
  );
}
