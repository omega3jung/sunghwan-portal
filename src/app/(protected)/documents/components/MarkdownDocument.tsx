import React, { Fragment, useMemo } from "react";

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "divider" };

const headingStyles: Record<1 | 2 | 3, string> = {
  1: "text-3xl font-semibold tracking-tight text-foreground",
  2: "mt-10 text-2xl font-semibold tracking-tight text-foreground",
  3: "mt-8 text-lg font-semibold tracking-tight text-foreground",
};

// The docs hub only needs a stable subset of markdown features from controlled
// local files, so a small renderer is easier to maintain than a full parser.
const parseMarkdownBlocks = (markdown: string): MarkdownBlock[] => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];

  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line === "---") {
      blocks.push({ type: "divider" });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        content: headingMatch[2],
      });
      index += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const currentLine = lines[index].trim();

      if (
        !currentLine ||
        currentLine === "---" ||
        /^(#{1,3})\s+/.test(currentLine) ||
        currentLine.startsWith("- ") ||
        /^\d+\.\s+/.test(currentLine)
      ) {
        break;
      }

      paragraphLines.push(currentLine);
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      content: paragraphLines.join(" "),
    });
  }

  return blocks;
};

// Inline rendering stays intentionally conservative so portfolio docs remain
// readable without introducing another markdown/runtime dependency.
const renderInlineMarkdown = (content: string): React.ReactNode[] => {
  const tokens = content.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g);

  return tokens.filter(Boolean).map((token, index) => {
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isExternal = /^(https?:\/\/|mailto:)/.test(href);

      if (!isExternal) {
        return (
          <span key={`${token}-${index}`} className="font-medium text-primary">
            {label}
          </span>
        );
      }

      return (
        <a
          key={`${token}-${index}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline underline-offset-4"
        >
          {label}
        </a>
      );
    }

    const boldMatch = token.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <strong
          key={`${token}-${index}`}
          className="font-semibold text-foreground"
        >
          {boldMatch[1]}
        </strong>
      );
    }

    const codeMatch = token.match(/^`([^`]+)`$/);
    if (codeMatch) {
      return (
        <code
          key={`${token}-${index}`}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {codeMatch[1]}
        </code>
      );
    }

    return <Fragment key={`${token}-${index}`}>{token}</Fragment>;
  });
};

// Keeping the markdown renderer separate makes the documents page orchestration
// easier to scan while preserving one place for future markdown rules.
export function MarkdownDocument({ markdown }: { markdown: string }) {
  const blocks = useMemo(() => parseMarkdownBlocks(markdown), [markdown]);

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const HeadingTag = `h${block.level}` as const;

            return (
              <HeadingTag
                key={`heading-${index}`}
                className={headingStyles[block.level]}
              >
                {renderInlineMarkdown(block.content)}
              </HeadingTag>
            );
          }

          case "paragraph":
            return (
              <p
                key={`paragraph-${index}`}
                className="text-[15px] leading-7 text-muted-foreground"
              >
                {renderInlineMarkdown(block.content)}
              </p>
            );

          case "unordered-list":
            return (
              <ul
                key={`unordered-${index}`}
                className="ml-5 list-disc space-y-2 text-[15px] leading-7 text-muted-foreground"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`unordered-item-${itemIndex}`}>
                    {renderInlineMarkdown(item)}
                  </li>
                ))}
              </ul>
            );

          case "ordered-list":
            return (
              <ol
                key={`ordered-${index}`}
                className="ml-5 list-decimal space-y-2 text-[15px] leading-7 text-muted-foreground"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`ordered-item-${itemIndex}`}>
                    {renderInlineMarkdown(item)}
                  </li>
                ))}
              </ol>
            );

          case "divider":
            return (
              <div
                key={`divider-${index}`}
                className="my-8 border-t border-border"
              />
            );
        }
      })}
    </div>
  );
}
