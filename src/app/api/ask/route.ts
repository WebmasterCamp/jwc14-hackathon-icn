import { NextResponse } from "next/server";
import { z } from "zod";
import { searchCatalogProducts, type CatalogCandidate } from "@/lib/catalog-search";
import { chatComplete, TyphoonConfigError } from "@/lib/typhoon";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const askSchema = z.object({
  query: z.string().trim().min(5, "กรุณาอธิบายโครงงานของคุณอย่างน้อย 5 ตัวอักษร").max(500),
});

// Shape consumed by <ProductCard /> on the client.
function toCardProduct(c: CatalogCandidate) {
  return {
    slug: c.slug,
    name: c.name,
    nameTh: c.nameTh,
    description: c.description,
    images: c.images,
    category: { name: c.categoryName, nameTh: c.categoryName },
    fromPrice: c.fromPrice,
    offeringCount: c.offeringCount,
  };
}

interface Recommendation {
  product: ReturnType<typeof toCardProduct>;
  reason: string;
}

const SYSTEM_PROMPT = `คุณคือผู้ช่วยแนะนำอุปกรณ์ STEM และ IoT สำหรับโรงเรียนไทยบนแพลตฟอร์มเช่าอุปกรณ์ "SparkGo"
หน้าที่ของคุณ: อ่านคำอธิบายโครงงาน/ความต้องการของผู้ใช้ แล้วเลือกอุปกรณ์ที่เหมาะสมที่สุด "จากแคตตาล็อกที่ให้มาเท่านั้น"

กฎ:
- ห้ามแนะนำสินค้าที่ไม่อยู่ในแคตตาล็อก ห้ามสร้าง slug ขึ้นเอง
- เลือก 3-6 รายการที่เกี่ยวข้องที่สุด เรียงจากเหมาะสมมากไปน้อย
- ให้เหตุผล (reason) เป็นภาษาไทยสั้น ๆ ไม่เกิน 2 ประโยค อธิบายว่าเหมาะกับโครงงานอย่างไร
- summary เป็นภาษาไทย 1-2 ประโยค สรุปแนวทางโดยรวม
- ตอบเป็น JSON เท่านั้น ตามรูปแบบ:
{"summary": "...", "recommendations": [{"slug": "...", "reason": "..."}]}`;

function buildCatalogContext(candidates: CatalogCandidate[]): string {
  return candidates
    .map((c, i) => {
      const parts = [
        `${i + 1}. slug: ${c.slug}`,
        `ชื่อ: ${c.nameTh || c.name}${c.nameTh ? ` (${c.name})` : ""}`,
        `หมวดหมู่: ${c.categoryName}`,
        `ราคาเริ่มต้น: ${c.fromPrice} บาท/เดือน`,
      ];
      if (c.curriculum.length) parts.push(`หลักสูตร: ${c.curriculum.join(", ")}`);
      if (c.description) parts.push(`รายละเอียด: ${c.description.slice(0, 200)}`);
      return parts.join(" | ");
    })
    .join("\n");
}

function parseModelJson(
  raw: string
): { summary?: string; recommendations?: { slug?: string; reason?: string }[] } | null {
  // Strip ```json fences if the model added them, then parse defensively.
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`ask:${clientKey(request)}`, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "คำขอมากเกินไป กรุณาลองใหม่อีกครั้งในอีกสักครู่" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "คำขอไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const { query } = parsed.data;
    const candidates = await searchCatalogProducts(query);
    const bySlug = new Map(candidates.map((c) => [c.slug, c]));

    if (candidates.length === 0) {
      return NextResponse.json({
        summary: "ขออภัย ยังไม่พบอุปกรณ์ในระบบที่เกี่ยวข้องกับโครงงานนี้",
        recommendations: [],
      });
    }

    // Fallback used when the model is unavailable: top keyword matches, no AI reason.
    const fallback = (note: string) =>
      NextResponse.json({
        summary: note,
        recommendations: candidates.slice(0, 6).map((c) => ({
          product: toCardProduct(c),
          reason: "",
        })) satisfies Recommendation[],
      });

    let content: string;
    try {
      content = await chatComplete(
        [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `โครงงาน/ความต้องการ: ${query}\n\nแคตตาล็อกที่เลือกได้:\n${buildCatalogContext(
              candidates
            )}`,
          },
        ],
        { json: true, temperature: 0.3, maxTokens: 900 }
      );
    } catch (err) {
      console.error("Typhoon call failed:", err);
      if (err instanceof TyphoonConfigError) {
        return fallback(
          "ระบบผู้ช่วย AI ยังไม่ได้ตั้งค่า แสดงอุปกรณ์ที่เกี่ยวข้องจากการค้นหาแทน"
        );
      }
      return fallback("ระบบ AI ไม่พร้อมใช้งานชั่วคราว แสดงอุปกรณ์ที่เกี่ยวข้องแทน");
    }

    const parsedModel = parseModelJson(content);
    if (!parsedModel?.recommendations) {
      return fallback("แสดงอุปกรณ์ที่เกี่ยวข้องกับโครงงานของคุณ");
    }

    // Ground the output: keep only slugs that actually exist in our candidates.
    const seen = new Set<string>();
    const recommendations: Recommendation[] = [];
    for (const rec of parsedModel.recommendations) {
      const slug = rec?.slug;
      if (!slug || seen.has(slug)) continue;
      const candidate = bySlug.get(slug);
      if (!candidate) continue; // drop hallucinated items
      seen.add(slug);
      recommendations.push({
        product: toCardProduct(candidate),
        reason: typeof rec.reason === "string" ? rec.reason : "",
      });
      if (recommendations.length >= 6) break;
    }

    if (recommendations.length === 0) {
      return fallback("แสดงอุปกรณ์ที่เกี่ยวข้องกับโครงงานของคุณ");
    }

    return NextResponse.json({
      summary:
        typeof parsedModel.summary === "string" && parsedModel.summary.trim()
          ? parsedModel.summary.trim()
          : "นี่คืออุปกรณ์ที่แนะนำสำหรับโครงงานของคุณ",
      recommendations,
    });
  } catch (error) {
    console.error("Error in /api/ask:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
