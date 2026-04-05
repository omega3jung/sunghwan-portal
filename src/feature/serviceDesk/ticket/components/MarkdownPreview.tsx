import { Fragment, useMemo } from "react";

type MarkdownPreviewProps = {
  value?: string | null;
};

export const MarkdownPreview = ({ value }: MarkdownPreviewProps) => {
  const bodyPreview = useMemo(
    () => renderMarkdownPreview(value ?? ""),
    [value],
  );

  return (
    <div className="min-h-52 space-y-3 rounded-md border border-input bg-transparent px-3 py-2 text-sm">
      {value ? bodyPreview : <span className="text-muted-foreground">-</span>}
    </div>
  );
};

const renderMarkdownPreview = (bodyValue: string) => {
  const blocks = bodyValue
    .split(/\n{2,}/)
    .filter((block) => block.trim().length > 0);

  return blocks.map((block, index) => {
    const lines = block.split("\n");

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return (
        <ul key={index} className="list-disc space-y-1 pl-5">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^[-*]\s+/, "")}</li>
          ))}
        </ul>
      );
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return (
        <ol key={index} className="list-decimal space-y-1 pl-5">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^\d+\.\s+/, "")}</li>
          ))}
        </ol>
      );
    }

    if (lines.every((line) => /^>\s?/.test(line))) {
      return (
        <blockquote
          key={index}
          className="border-l-2 border-border pl-3 text-muted-foreground"
        >
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {line.replace(/^>\s?/, "")}
              {lineIndex < lines.length - 1 ? <br /> : null}
            </Fragment>
          ))}
        </blockquote>
      );
    }

    const headingMatch = lines[0]?.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      return (
        <div key={index} className="space-y-2">
          <p className="font-semibold">{headingMatch[2]}</p>
          {lines.length > 1 ? (
            <p className="whitespace-pre-wrap text-sm leading-6">
              {lines.slice(1).join("\n")}
            </p>
          ) : null}
        </div>
      );
    }

    if (block.startsWith("```") && block.endsWith("```")) {
      return (
        <pre
          key={index}
          className="overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs"
        >
          <code>
            {block.replace(/^```[\w-]*\n?/, "").replace(/\n?```$/, "")}
          </code>
        </pre>
      );
    }

    return (
      <p key={index} className="whitespace-pre-wrap leading-6">
        {block}
      </p>
    );
  });
};
