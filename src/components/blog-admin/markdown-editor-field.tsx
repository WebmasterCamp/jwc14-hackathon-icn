"use client";

import dynamic from "next/dynamic";

// MDXEditor must load client-side only (it touches the DOM). Loaded via
// next/dynamic with ssr:false; reused for both `content` and `contentTh`.
const MdxEditorImpl = dynamic(() => import("./mdx-editor-impl"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] animate-pulse rounded-md border bg-muted" />
  ),
});

export function MarkdownEditorField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <MdxEditorImpl
      markdown={value || ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
