"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils/presentation";

import { resolveRichEditorPreset } from "./presets";
import type {
  RichEditorPreset,
  RichEditorPresetName,
  RichEditorToolbarHandlers,
  RichEditorToolbarItemKey,
  RichEditorToolbarLabels,
} from "./types";

type RichEditorToolbarProps = {
  disabled?: boolean;
  editor: Editor | null;
  labels?: RichEditorToolbarLabels;
  preset?: RichEditorPreset | RichEditorPresetName;
  readOnly?: boolean;
  handlers?: RichEditorToolbarHandlers;
  className?: string;
};

const DEFAULT_LABELS: Record<RichEditorToolbarItemKey, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strike",
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  blockquote: "Quote",
  codeBlock: "Code block",
  link: "Link",
  image: "Image",
  table: "Table",
  undo: "Undo",
  redo: "Redo",
};

const DEFAULT_LINK_PROMPT = "Enter a URL";
const DEFAULT_IMAGE_PROMPT = "Enter an image URL";

export function RichEditorToolbar({
  className,
  disabled = false,
  editor,
  handlers,
  labels = {},
  preset = "default",
  readOnly = false,
}: RichEditorToolbarProps) {
  const resolvedPreset = resolveRichEditorPreset(preset);
  const actionDisabled = disabled || readOnly;

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 border-b border-border/50 p-2",
          className,
        )}
      >
        {resolvedPreset.toolbar.map((group, groupIndex) => (
          <ToolbarGroup
            key={`${resolvedPreset.name}-${groupIndex}`}
            showSeparator={groupIndex < resolvedPreset.toolbar.length - 1}
          >
            {group.map((itemKey) => {
              const item = createToolbarItem(itemKey);
              const label = labels[itemKey] || DEFAULT_LABELS[itemKey];
              const itemDisabled =
                !editor ||
                actionDisabled ||
                (item.canRun ? !item.canRun(editor) : false);

              return (
                <Tooltip key={itemKey}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={label}
                        className={cn(
                          "h-8 w-8 rounded-md hover:bg-muted/40",
                          editor &&
                            item.isActive?.(editor) &&
                            "bg-muted text-foreground",
                        )}
                        onClick={() => {
                          if (!editor || itemDisabled) {
                            return;
                          }

                          item.run(editor, labels, handlers);
                        }}
                        disabled={itemDisabled}
                      >
                        {item.icon}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </ToolbarGroup>
        ))}
      </div>
    </TooltipProvider>
  );
}

function ToolbarGroup({
  children,
  showSeparator,
}: {
  children: ReactNode;
  showSeparator: boolean;
}) {
  return (
    <>
      {children}
      {showSeparator ? (
        <Separator orientation="vertical" className="mx-1 h-6" />
      ) : null}
    </>
  );
}

function createToolbarItem(key: RichEditorToolbarItemKey) {
  switch (key) {
    case "bold":
      return {
        icon: <Bold className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("bold"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleBold().run(),
        run: (editor: Editor) => editor.chain().focus().toggleBold().run(),
      };
    case "italic":
      return {
        icon: <Italic className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("italic"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleItalic().run(),
        run: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
      };
    case "underline":
      return {
        icon: <Underline className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("underline"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleUnderline().run(),
        run: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
      };
    case "strike":
      return {
        icon: <Strikethrough className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("strike"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleStrike().run(),
        run: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
      };
    case "bulletList":
      return {
        icon: <List className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("bulletList"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleBulletList().run(),
        run: (editor: Editor) =>
          editor.chain().focus().toggleBulletList().run(),
      };
    case "orderedList":
      return {
        icon: <ListOrdered className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("orderedList"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleOrderedList().run(),
        run: (editor: Editor) =>
          editor.chain().focus().toggleOrderedList().run(),
      };
    case "blockquote":
      return {
        icon: <Quote className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("blockquote"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleBlockquote().run(),
        run: (editor: Editor) =>
          editor.chain().focus().toggleBlockquote().run(),
      };
    case "codeBlock":
      return {
        icon: <Code2 className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("codeBlock"),
        canRun: (editor: Editor) =>
          editor.can().chain().focus().toggleCodeBlock().run(),
        run: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
      };
    case "link":
      return {
        icon: <Link2 className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("link"),
        canRun: () => true,
        run: (
          editor: Editor,
          labels?: RichEditorToolbarLabels,
          handlers?: RichEditorToolbarHandlers,
        ) => {
          if (handlers?.onLink) {
            handlers.onLink({ editor, labels: labels ?? {} });
            return;
          }

          runDefaultLinkAction(editor, labels);
        },
      };
    case "image":
      return {
        icon: <ImagePlus className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("image"),
        canRun: () => true,
        run: (
          editor: Editor,
          labels?: RichEditorToolbarLabels,
          handlers?: RichEditorToolbarHandlers,
        ) => {
          if (handlers?.onImage) {
            handlers.onImage({ editor, labels: labels ?? {} });
            return;
          }

          runDefaultImageAction(editor, labels);
        },
      };
    case "table":
      return {
        icon: <Table2 className="h-4 w-4" />,
        isActive: (editor: Editor) => editor.isActive("table"),
        canRun: (editor: Editor) =>
          editor.isActive("table")
            ? editor.can().chain().focus().deleteTable().run()
            : editor
                .can()
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
        run: (
          editor: Editor,
          labels?: RichEditorToolbarLabels,
          handlers?: RichEditorToolbarHandlers,
        ) => {
          if (handlers?.onTable) {
            handlers.onTable({ editor, labels: labels ?? {} });
            return;
          }

          runDefaultTableAction(editor);
        },
      };
    case "undo":
      return {
        icon: <Undo2 className="h-4 w-4" />,
        canRun: (editor: Editor) => editor.can().undo(),
        run: (editor: Editor) => editor.chain().focus().undo().run(),
      };
    case "redo":
      return {
        icon: <Redo2 className="h-4 w-4" />,
        canRun: (editor: Editor) => editor.can().redo(),
        run: (editor: Editor) => editor.chain().focus().redo().run(),
      };
  }
}

function runDefaultLinkAction(
  editor: Editor,
  labels?: RichEditorToolbarLabels,
) {
  const previousUrl = String(editor.getAttributes("link").href ?? "");
  const value = window.prompt(
    labels?.linkPrompt || DEFAULT_LINK_PROMPT,
    previousUrl || "https://",
  );

  if (value === null) {
    return;
  }

  const nextUrl = normalizeUrl(value);
  const chain = editor.chain().focus().extendMarkRange("link");

  if (!nextUrl) {
    chain.unsetLink().run();
    return;
  }

  chain.setLink({ href: nextUrl }).run();
}

function runDefaultImageAction(
  editor: Editor,
  labels?: RichEditorToolbarLabels,
) {
  const value = window.prompt(labels?.imagePrompt || DEFAULT_IMAGE_PROMPT, "");

  if (value === null) {
    return;
  }

  const src = value.trim();

  if (!src) {
    return;
  }

  editor.chain().focus().setImage({ src }).run();
}

function runDefaultTableAction(editor: Editor) {
  if (editor.isActive("table")) {
    editor.chain().focus().deleteTable().run();
    return;
  }

  editor
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
}

function normalizeUrl(value: string) {
  const nextValue = value.trim();

  if (!nextValue) {
    return "";
  }

  return /^[a-z]+:\/\//i.test(nextValue) ? nextValue : `https://${nextValue}`;
}
