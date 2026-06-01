/**
 * Minimal Typhoon AI client.
 *
 * Typhoon (https://opentyphoon.ai) exposes an OpenAI-compatible Chat Completions
 * API, so we call it with the built-in `fetch` — no SDK dependency. This module
 * is SERVER-ONLY: it reads `TYPHOON_API_KEY` and must never be imported into a
 * client component.
 */

export class TyphoonConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TyphoonConfigError";
  }
}

export class TyphoonRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "TyphoonRequestError";
    this.status = status;
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  /** Force a JSON object response (OpenAI-compatible `response_format`). */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

/**
 * Call Typhoon chat completions and return the assistant's text content.
 * Throws {@link TyphoonConfigError} if the API key is missing (so callers can
 * degrade gracefully) and {@link TyphoonRequestError} on a non-2xx response.
 */
export async function chatComplete(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): Promise<string> {
  const apiKey = process.env.TYPHOON_API_KEY;
  if (!apiKey) {
    throw new TyphoonConfigError("TYPHOON_API_KEY is not configured");
  }

  const baseUrl = process.env.TYPHOON_BASE_URL || "https://api.opentyphoon.ai/v1";
  const model = process.env.TYPHOON_MODEL || "typhoon-v2.5-30b-a3b-instruct";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 1024,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new TyphoonRequestError(
      `Typhoon request failed (${res.status}): ${detail.slice(0, 300)}`,
      res.status
    );
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new TyphoonRequestError("Typhoon returned an empty response", 502);
  }
  return content;
}
