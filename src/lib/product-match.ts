/**
 * Helpers for the shared Product catalog and its duplicate-detection key.
 *
 * `matchKey` is the normalized string whose @unique constraint on Product
 * physically prevents two catalog entries for the same physical product.
 * Prefer brand+model when present (most reliable), otherwise fall back to the
 * product name. Used by the equipment-create API (auto-match safety net), the
 * seed script, and the one-time backfill so they all dedupe identically.
 */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s\-_/.]+/g, " ") // collapse separators to single spaces
    .replace(/[^\p{L}\p{N} ]/gu, "") // strip punctuation, keep letters/numbers (any script)
    .replace(/\s+/g, " ")
    .trim();
}

export function buildMatchKey(input: {
  brand?: string | null;
  model?: string | null;
  name?: string | null;
  nameTh?: string | null;
}): string {
  const brandModel = [input.brand, input.model]
    .filter((v): v is string => Boolean(v && v.trim()))
    .join(" ");
  const basis = brandModel || input.name || input.nameTh || "";
  const key = normalize(basis);
  return key || "product";
}

/**
 * Build a URL-safe slug from a product name. Latin text slugifies normally;
 * non-Latin (e.g. Thai-only) names fall back to a generic base. A short unique
 * suffix is always appended by the caller to guarantee the slug is unique.
 */
export function slugifyBase(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "product";
}

export function buildProductSlug(name: string, uniqueSuffix: string): string {
  return `${slugifyBase(name)}-${uniqueSuffix.slice(-6)}`;
}
