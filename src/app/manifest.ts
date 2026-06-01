import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sparkgo - ระบบเช่าอุปกรณ์การศึกษา IoT และ STEM",
    short_name: "Sparkgo",
    description:
      "แพลตฟอร์มเช่าอุปกรณ์ IoT และ STEM สำหรับโรงเรียนไทย เพื่อการเรียนรู้ที่ทันสมัย",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563EB",
    lang: "th",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
