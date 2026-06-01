"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

import { AskClient } from "@/components/ask/ask-client";

/**
 * Floating icon button that opens the AI assistant as a small panel
 * anchored to the bottom-right corner. Rendered globally from the public layout.
 */
export function AskLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open ? (
        <div className="flex w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-xl">
          <div className="flex items-center justify-between border-b bg-brand/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-brand" />
              ผู้ช่วย AI
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="ปิด"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <AskClient />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="ถามผู้ช่วย AI"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg transition-transform hover:scale-105 hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
