import { ImageResponse } from "next/og";

export const alt = "Sparkgo Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          gap: 24,
          background: "linear-gradient(135deg, #2563EB 0%, #10B981 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 80, fontWeight: 800 }}>
          Sparkgo Blog
        </div>
        <div style={{ display: "flex", fontSize: 34, opacity: 0.95 }}>
          IoT, STEM &amp; EdTech insights
        </div>
      </div>
    ),
    { ...size }
  );
}
