import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blog/queries";

export const alt = "Sparkgo Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Use the (Latin) `title` field rather than the Thai `titleTh` because the
// default ImageResponse font only ships Latin glyphs — Thai text would render
// as tofu boxes without bundling a Thai font.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  const title = post?.title ?? "Sparkgo Blog";
  const category = post?.categories?.[0]?.category?.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #2563EB 0%, #10B981 100%)",
          padding: "80px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
          Sparkgo
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {category && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: "rgba(255,255,255,0.2)",
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 28,
              }}
            >
              {category}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
            {title.length > 90 ? `${title.slice(0, 90)}…` : title}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>
          IoT & STEM Equipment Rental for Thai Schools
        </div>
      </div>
    ),
    { ...size }
  );
}
