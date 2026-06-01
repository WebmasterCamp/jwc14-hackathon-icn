"use client";

import { useEffect } from "react";

const BRAND = "#27BEE4";

/**
 * Last-resort boundary for errors thrown in the root layout itself. It replaces
 * the entire document, so it must render its own <html>/<body> and cannot rely
 * on the app's fonts/providers — styles are inlined to stay self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="th">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5fbfd",
          color: "#171717",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', 'IBM Plex Sans Thai', sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p
            style={{
              fontSize: "5rem",
              fontWeight: 800,
              lineHeight: 1,
              margin: 0,
              color: BRAND,
            }}
          >
            500
          </p>
          <h1 style={{ marginTop: 16, fontSize: "1.5rem", fontWeight: 700 }}>
            เกิดข้อผิดพลาดร้ายแรง
          </h1>
          <p style={{ marginTop: 12, color: "rgba(23,23,23,0.7)" }}>
            ขออภัย ระบบไม่สามารถแสดงหน้านี้ได้ กรุณาลองใหม่อีกครั้ง
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              borderRadius: 9999,
              border: "none",
              backgroundColor: BRAND,
              color: "#fff",
              padding: "12px 32px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ลองอีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
