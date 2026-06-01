import Image from "next/image";
import { SectionHeading } from "@/components/home/section-heading";

const baseProjects = [
  "/assets/iot1.png",
  "/assets/iot2.png",
  "/assets/iot3.png",
];

// The Figma shows a continuously scrolling row, so the base set repeats.
const projects = [...baseProjects, ...baseProjects].map((image, i) => ({
  image,
  label: `ตัวอย่าง#${String((i % baseProjects.length) + 1).padStart(2, "0")}`,
}));

export function ProjectExamples() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <SectionHeading>ตัวอย่างโปรเจกต์ลูกค้าเรา</SectionHeading>
      </div>

      {/* Full-bleed horizontal scroller with snap; cards peek off both edges */}
      <div className="flex snap-x gap-6 overflow-x-auto px-4 pb-4 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {projects.map((p, i) => (
          <article
            key={`${p.label}-${i}`}
            className="group w-72 shrink-0 snap-start overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="relative h-48 overflow-hidden bg-muted">
              <Image
                src={p.image}
                alt={p.label}
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
                <path
                  fill="currentColor"
                  d="M0 28 C100 4 300 52 400 18 L400 56 L0 56 Z"
                />
              </svg>
              <span className="absolute bottom-3 left-4 z-10 text-base font-bold text-brand-foreground drop-shadow">
                {p.label}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
