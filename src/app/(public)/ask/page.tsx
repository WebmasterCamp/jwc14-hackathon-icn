import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { AskClient } from "@/components/ask/ask-client";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sparkgo.co.th";

export const metadata: Metadata = {
  title: "ถามผู้ช่วย AI",
  description:
    "อธิบายโครงงานหรือสิ่งที่อยากสอน แล้วให้ผู้ช่วย AI แนะนำอุปกรณ์ IoT และ STEM ที่เหมาะสมจากแคตตาล็อกของ SparkGo",
  alternates: { canonical: `${SITE_URL}/ask` },
};

export default function AskPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
          <Sparkles className="h-4 w-4" />
          ผู้ช่วย AI
        </div>
        <h1 className="text-3xl font-bold">บอกโครงงานของคุณ แล้วเราจะแนะนำอุปกรณ์</h1>
        <p className="mt-2 text-muted-foreground">
          อธิบายสิ่งที่อยากทำหรืออยากสอน ผู้ช่วย AI จะค้นหาและแนะนำอุปกรณ์ที่เหมาะสมจากร้านค้าในระบบ
        </p>
      </div>

      <AskClient />
    </div>
  );
}
