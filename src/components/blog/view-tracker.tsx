"use client";

import { useEffect, useRef } from "react";

/**
 * Fire-and-forget view counter. Posts once per mount to the existing
 * /api/blog/posts/[slug]/view route. Kept out of the Server Component so that
 * ISR-cached renders don't suppress (or render-time writes don't trigger) the
 * increment. Failures are ignored.
 */
export function ViewTracker({ slug }: { slug: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch(`/api/blog/posts/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
