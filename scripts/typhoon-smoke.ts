/**
 * Throwaway live smoke test for the Typhoon AI client.
 * Run: npx tsx scripts/typhoon-smoke.ts
 */
import "dotenv/config";
import { chatComplete, TyphoonConfigError, TyphoonRequestError } from "../src/lib/typhoon";

async function run(label: string, fn: () => Promise<string>) {
  const start = Date.now();
  try {
    const out = await fn();
    console.log(`\n✅ ${label}  (${Date.now() - start}ms)`);
    console.log(out.slice(0, 500));
    return out;
  } catch (err) {
    console.log(`\n❌ ${label}  (${Date.now() - start}ms)`);
    if (err instanceof TyphoonConfigError) {
      console.log("CONFIG ERROR:", err.message);
    } else if (err instanceof TyphoonRequestError) {
      console.log(`REQUEST ERROR (status ${err.status}):`, err.message);
    } else {
      console.log("UNKNOWN ERROR:", err);
    }
    return null;
  }
}

(async () => {
  console.log("Model:", process.env.TYPHOON_MODEL || "(default) typhoon-v2.1-12b-instruct");
  console.log("Base URL:", process.env.TYPHOON_BASE_URL || "(default) https://api.opentyphoon.ai/v1");
  console.log("API key set:", Boolean(process.env.TYPHOON_API_KEY));

  // Test 1: plain Thai chat
  await run("Plain chat", () =>
    chatComplete(
      [{ role: "user", content: "ตอบสั้น ๆ ว่า Arduino คืออะไร" }],
      { maxTokens: 200, signal: AbortSignal.timeout(30_000) }
    )
  );

  // Test 2: JSON mode (used by /api/ask)
  const jsonOut = await run("JSON mode", () =>
    chatComplete(
      [
        { role: "system", content: 'ตอบเป็น JSON เท่านั้น รูปแบบ {"items": ["..."]}' },
        { role: "user", content: "แนะนำเซ็นเซอร์ 3 ชนิดสำหรับโครงงาน IoT" },
      ],
      { json: true, maxTokens: 200, signal: AbortSignal.timeout(30_000) }
    )
  );

  if (jsonOut) {
    try {
      JSON.parse(jsonOut);
      console.log("   → JSON.parse OK (valid JSON object)");
    } catch {
      console.log("   → ⚠️  JSON.parse FAILED — model returned non-JSON in json mode");
    }
  }
})();
