"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import Underline from "@tiptap/extension-underline";
import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { CSSProperties, MutableRefObject } from "react";
import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/shared/utils";

import { resolveRichEditorPreset } from "./presets";
import { RichEditorToolbar } from "./RichEditorToolbar";
import type {
  RichEditorPreset,
  RichEditorPresetName,
  RichEditorToolbarHandlers,
  RichEditorToolbarLabels,
} from "./types";

type RichEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  error?: boolean | string;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: number | string;
  preset?: RichEditorPreset | RichEditorPresetName;
  showToolbar?: boolean;
  toolbarLabels?: RichEditorToolbarLabels;
  toolbarHandlers?: RichEditorToolbarHandlers;
  onEditorReady?: (editor: Editor | null) => void;
  id?: string;
  className?: string;
  toolbarClassName?: string;
  contentClassName?: string;
};

const DEFAULT_EDITOR_MIN_HEIGHT = "10rem";
const DEFAULT_EDITOR_CONTENT_CLASS_NAME =
  "px-4 py-3 text-sm focus:outline-none prose prose-sm max-w-none break-words prose-p:my-2 prose-p:leading-6 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:my-3 prose-blockquote:border-l prose-blockquote:border-border prose-blockquote:pl-3 prose-blockquote:text-muted-foreground prose-a:text-primary prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 [&_img]:max-h-64 [&_img]:rounded-md [&_img]:object-contain [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1.5";

export function RichEditor({
  className,
  contentClassName,
  disabled = false,
  error = false,
  id,
  minHeight = DEFAULT_EDITOR_MIN_HEIGHT,
  onChange,
  onEditorReady,
  placeholder = "",
  preset = "default",
  readOnly = false,
  showToolbar = true,
  toolbarClassName,
  toolbarHandlers,
  toolbarLabels,
  value = "",
}: RichEditorProps) {
  const placeholderRef = useRef(placeholder);
  const resolvedPreset = useMemo(
    () => resolveRichEditorPreset(preset),
    [preset],
  );
  const extensions = useMemo(
    () => createEditorExtensions(placeholderRef, resolvedPreset),
    [resolvedPreset],
  );
  const editor = useEditor({
    immediatelyRender: false,
    editable: !(disabled || readOnly),
    extensions,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[var(--rich-editor-min-height)]",
          DEFAULT_EDITOR_CONTENT_CLASS_NAME,
          contentClassName,
        ),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(getEditorHTML(currentEditor));
    },
  });

  useEffect(() => {
    placeholderRef.current = placeholder;

    if (editor?.isEmpty) {
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, placeholder]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!(disabled || readOnly));
  }, [disabled, editor, readOnly]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = normalizeRichEditorValue(value);
    const currentValue = getEditorHTML(editor);

    if (!nextValue) {
      if (currentValue) {
        editor.commands.clearContent(false);
      }

      return;
    }

    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    onEditorReady?.(editor);

    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  return (
    <div
      className={cn(
        "rounded-md border border-input bg-background shadow-sm",
        disabled && "opacity-60",
        error && "border-destructive/60",
        className,
      )}
      style={
        {
          "--rich-editor-min-height":
            typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        } as CSSProperties
      }
    >
      {showToolbar ? (
        <RichEditorToolbar
          className={toolbarClassName}
          disabled={disabled}
          editor={editor}
          handlers={toolbarHandlers}
          labels={toolbarLabels}
          preset={resolvedPreset}
          readOnly={readOnly}
        />
      ) : null}
      <EditorContent
        id={id}
        editor={editor}
        className={cn(
          "editor-wrapper min-h-[var(--rich-editor-min-height)]",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          error && "[&_.ProseMirror]:text-destructive",
        )}
      />
    </div>
  );
}

function createEditorExtensions(
  placeholderRef: MutableRefObject<string>,
  preset: RichEditorPreset,
) {
  const enabledToolbarItems = new Set(preset.toolbar.flat());

  return [
    StarterKit,
    Underline,
    ...(enabledToolbarItems.has("link")
      ? [
          Link.configure({
            openOnClick: false,
          }),
        ]
      : []),
    ...(enabledToolbarItems.has("image") ? [Image] : []),
    ...(enabledToolbarItems.has("table") ? [TableKit] : []),
    Placeholder.configure({
      placeholder: () => placeholderRef.current,
    }),
  ];
}

function normalizeRichEditorValue(value?: string) {
  return value?.trim() ?? "";
}

function getEditorHTML(editor: Editor) {
  return editor.isEmpty ? "" : editor.getHTML();
}
