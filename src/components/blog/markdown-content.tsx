import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";

/**
 * Server Component that renders trusted Markdown content to React elements.
 *
 * - `react-markdown` does NOT render raw HTML by default (no rehype-raw), so the
 *   XSS surface is minimal; `rehype-sanitize` is added as defense-in-depth.
 * - Styling is supplied via an explicit `components` map to match the OKLch
 *   theme without pulling in @tailwindcss/typography.
 */

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-2xl font-bold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-4 leading-7 text-foreground/90">{children}</p>
  ),
  a: ({ href, children }) => (
    <Link
      href={href ?? "#"}
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </Link>
  ),
  ul: ({ children }) => (
    <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="font-mono text-sm">{children}</code>
      );
    }
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
      {children}
    </pre>
  ),
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? ""}
        className="my-6 rounded-lg"
        loading="lazy"
      />
    ) : null,
  hr: () => <hr className="my-8 border-border" />,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2">{children}</td>
  ),
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
