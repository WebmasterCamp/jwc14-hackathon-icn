/**
 * Renders JSON-LD structured data as a <script> tag.
 *
 * Per Next.js docs (02-guides/json-ld.md), JSON-LD should be rendered as a raw
 * <script type="application/ld+json"> inside a Server Component, with `<`
 * escaped to `<` to prevent XSS injection. Do NOT use next/script.
 *
 * Accepts a single schema object or an array of them.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
