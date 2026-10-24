import { Fragment, type ReactNode } from "react";

/*
 * Members write plain text with two conventions from the mock-up: **bold** and lines
 * starting with "- " for lists. Parsing to React elements (never to an HTML string)
 * means user content is always escaped.
 */

export type Block = { kind: "paragraph"; lines: string[] } | { kind: "list"; items: string[] };

export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];

  for (const chunk of text.replace(/\r\n?/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");
    let paragraph: string[] = [];
    let list: string[] = [];

    const flush = () => {
      if (paragraph.length) blocks.push({ kind: "paragraph", lines: paragraph });
      if (list.length) blocks.push({ kind: "list", items: list });
      paragraph = [];
      list = [];
    };

    for (const line of lines) {
      if (/^\s*- /.test(line)) {
        if (paragraph.length) {
          blocks.push({ kind: "paragraph", lines: paragraph });
          paragraph = [];
        }
        list.push(line.replace(/^\s*- /, ""));
      } else {
        if (list.length) {
          blocks.push({ kind: "list", items: list });
          list = [];
        }
        paragraph.push(line);
      }
    }
    flush();
  }

  return blocks;
}

const INLINE = /(\*\*[^*\n]+\*\*|(?<![\w@])@[A-Za-z0-9_.-]*[A-Za-z0-9_])/g;

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (/^@[A-Za-z0-9_.-]+$/.test(part)) {
      return (
        <span key={index} className="bg-brand-soft px-1 font-semibold text-brand-text">
          {part}
        </span>
      );
    }
    return part;
  });
}

export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`prose-post ${className ?? ""}`}>
      {parseBlocks(text).map((block, index) =>
        block.kind === "list" ? (
          <ul key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {renderInline(line)}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
