"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { SectionHeading } from "@/components/home/section-heading";

export interface ProjectExampleItem {
  id: string;
  title: string;
  image: string;
}

// Shown before any project examples are configured in the admin dashboard, so
// the landing-page section never renders empty.
const FALLBACK: ProjectExampleItem[] = [
  { id: "fallback-1", title: "ตัวอย่าง#01", image: "/assets/iot1.png" },
  { id: "fallback-2", title: "ตัวอย่าง#02", image: "/assets/iot2.png" },
  { id: "fallback-3", title: "ตัวอย่าง#03", image: "/assets/iot3.png" },
];

// px / second the marquee advances when running.
const SPEED = 40;

function ProjectCard({ project }: { project: ProjectExampleItem }) {
  return (
    <article className="group mr-6 w-72 shrink-0 overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="288px"
        />
        {/* cyan wave bottom (matches Figma) */}
        <svg
          className="absolute inset-x-0 bottom-0 h-14 w-full text-brand"
          viewBox="0 0 400 56"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path fill="currentColor" d="M0 28 C100 4 300 52 400 18 L400 56 L0 56 Z" />
        </svg>
        <span className="absolute bottom-3 left-4 z-10 text-base font-bold text-brand-foreground drop-shadow">
          {project.title}
        </span>
      </div>
    </article>
  );
}

export function ProjectExamples({
  projects,
}: {
  projects?: ProjectExampleItem[];
}) {
  const items = projects && projects.length > 0 ? projects : FALLBACK;
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  // Pause when the pointer is hovering OR actively holding (touch/drag).
  const [hovering, setHovering] = useState(false);
  const [holding, setHolding] = useState(false);
  const paused = hovering || holding;

  useAnimationFrame((_, delta) => {
    if (paused) return;
    const track = trackRef.current;
    if (!track) return;
    // The track renders the set twice; each card carries its own trailing
    // margin, so half the scroll width is exactly one full, seamless set.
    const half = track.scrollWidth / 2;
    if (half === 0) return;
    let next = x.get() - (SPEED * delta) / 1000;
    if (next <= -half) next += half;
    x.set(next);
  });

  // Honour reduced-motion: fall back to a plain, manually scrollable row.
  if (prefersReducedMotion) {
    return (
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <SectionHeading>ตัวอย่างโปรเจกต์ลูกค้าเรา</SectionHeading>
        </div>
        <div className="flex snap-x overflow-x-auto px-4 pb-4 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((p) => (
            <div key={p.id} className="snap-start">
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <SectionHeading>ตัวอย่างโปรเจกต์ลูกค้าเรา</SectionHeading>
      </div>

      {/* Auto-scrolling marquee — pauses on hover or pointer hold */}
      <div
        className="overflow-hidden px-4 pb-4 lg:px-8"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
      >
        <motion.div ref={trackRef} style={{ x }} className="flex w-max">
          {[...items, ...items].map((p, i) => (
            <ProjectCard key={`${p.id}-${i}`} project={p} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
