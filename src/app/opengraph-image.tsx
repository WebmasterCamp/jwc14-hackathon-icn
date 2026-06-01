import { ImageResponse } from "next/og";

export const alt = "Sparkgo - IoT & STEM Equipment Rental for Thai Schools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Root Open Graph image. File-based metadata overrides the metadata object in
// layout.tsx, so this replaces the previously referenced (and missing)
// /og-image.png. Latin-only text to stay within the default font's glyphs.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "linear-gradient(135deg, #2563EB 0%, #10B981 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800 }}>
          Sparkgo
        </div>
        <div style={{ display: "flex", fontSize: 36, opacity: 0.95 }}>
          IoT &amp; STEM Equipment Rental for Thai Schools
        </div>
      </div>
    ),
    { ...size }
  );
}
