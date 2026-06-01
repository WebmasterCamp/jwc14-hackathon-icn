import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sparkgo - ระบบเช่าอุปกรณ์การศึกษา IoT และ STEM สำหรับโรงเรียน",
    template: "%s | Sparkgo",
  },
  description: "แพลตฟอร์มเช่าอุปกรณ์ IoT และ STEM สำหรับโรงเรียนไทย เพื่อการเรียนรู้ที่ทันสมัย พร้อมระบบสัญญาเช่า การชำระเงิน และบริการหลังการขาย",
  keywords: [
    "เช่าอุปกรณ์การศึกษา",
    "IoT สำหรับโรงเรียน",
    "STEM education",
    "อุปกรณ์ STEM",
    "เช่าอุปกรณ์ IoT",
    "โรงเรียนไทย",
    "education technology",
    "equipment rental",
    "Thailand schools",
    "การศึกษา",
    "เทคโนโลยีการศึกษา",
  ],
  authors: [{ name: "Sparkgo Team" }],
  creator: "Sparkgo",
  publisher: "Sparkgo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: "Sparkgo",
    title: "Sparkgo - ระบบเช่าอุปกรณ์การศึกษา IoT และ STEM สำหรับโรงเรียน",
    description: "แพลตฟอร์มเช่าอุปกรณ์ IoT และ STEM สำหรับโรงเรียนไทย เพื่อการเรียนรู้ที่ทันสมัย",
    // Open Graph / Twitter images are supplied by the file-based metadata
    // convention (app/opengraph-image.tsx and per-route opengraph-image.tsx).
    // Hardcoding `images` here would override those generated images on every
    // page, so it is intentionally omitted.
  },
  twitter: {
    card: "summary_large_image",
    title: "Sparkgo - ระบบเช่าอุปกรณ์การศึกษา",
    description: "แพลตฟอร์มเช่าอุปกรณ์ IoT และ STEM สำหรับโรงเรียนไทย",
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      th: `${SITE_URL}?lang=th`,
      en: `${SITE_URL}?lang=en`,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${ibmPlexSansThai.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
              <Toaster position="top-right" richColors />
            </TooltipProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
