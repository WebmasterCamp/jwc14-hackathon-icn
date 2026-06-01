"use client";

import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  ListsToggle,
  InsertTable,
  InsertThematicBreak,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

/**
 * The actual MDXEditor instance. Imported only on the client (via next/dynamic
 * with ssr:false from markdown-editor-field.tsx) because it touches the DOM.
 *
 * The editor's value IS Markdown, so it round-trips cleanly with the public
 * Markdown renderer. `markdown` is read at mount; typing reports changes via
 * `onChange` (we don't push the value back to avoid caret jumps).
 */
export default function MdxEditorImpl({
  markdown,
  onChange,
  placeholder,
}: {
  markdown: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <MDXEditor
      markdown={markdown}
      onChange={onChange}
      placeholder={placeholder}
      contentEditableClassName="min-h-[240px] prose max-w-none"
      className="rounded-md border bg-background"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <ListsToggle />
              <CreateLink />
              <InsertTable />
              <InsertThematicBreak />
            </>
          ),
        }),
      ]}
    />
  );
}
