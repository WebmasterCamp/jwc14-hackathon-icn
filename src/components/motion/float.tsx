"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatProps {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px (peak-to-peak is 2×). Default 12. */
  y?: number;
  /** Horizontal travel in px. Default 0. */
  x?: number;
  /** Rotation sway in degrees. Default 0. */
  rotate?: number;
  /** One-way duration in seconds. Default 4. */
  duration?: number;
  /** Start delay in seconds, used to desync sibling elements. Default 0. */
  delay?: number;
}

/**
 * Gentle, infinitely looping float used for the landing-page hero decorations
 * (board cards, the student illustration, doodle background, rings/dots).
 * Honors prefers-reduced-motion by rendering a static element instead.
 */
export function Float({
  children,
  className,
  y = 12,
  x = 0,
  rotate = 0,
  duration = 4,
  delay = 0,
}: FloatProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [-y, y], x: x ? [-x, x] : 0, rotate: rotate ? [-rotate, rotate] : 0 }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
