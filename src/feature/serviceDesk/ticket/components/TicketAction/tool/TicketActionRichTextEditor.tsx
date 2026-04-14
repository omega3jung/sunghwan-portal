"use client";

import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";

type TicketActionRichTextEditorProps = {
  placeholderKey: string;
  errorMessage: string;
  content?: string;
  onEditorReady: (editor: Editor | null) => void;
  onTextChange: (hasText: boolean) => void;
  onContentChange?: (content: string) => void;
};

export function TicketActionRichTextEditor({
  placeholderKey,
  errorMessage,
  content = "",
  onEditorReady,
  onTextChange,
  onContentChange,
}: TicketActionRichTextEditorProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const placeholderRef = useRef("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: () => placeholderRef.current,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-40 px-4 py-3 text-sm focus:outline-none prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:my-3 prose-blockquote:border-l prose-blockquote:border-border prose-blockquote:pl-3 prose-blockquote:text-muted-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onTextChange(Boolean(currentEditor.getText().trim()));
      onContentChange?.(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    placeholderRef.current = t(placeholderKey);

    if (editor?.isEmpty) {
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, placeholderKey, t]);

  useEffect(() => {
    if (!editor || !onContentChange) {
      return;
    }

    const nextContent = content.trim();
    const currentText = editor.getText().trim();

    if (!nextContent) {
      if (currentText) {
        editor.commands.clearContent(false);
        onTextChange(false);
      }

      return;
    }

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
      onTextChange(Boolean(editor.getText().trim()));
    }
  }, [content, editor, onContentChange, onTextChange]);

  useEffect(() => {
    onEditorReady(editor);

    return () => onEditorReady(null);
  }, [editor, onEditorReady]);

  return (
    <EditorContent
      editor={editor}
      className={cn(
        "editor-wrapper min-h-40",
        "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        errorMessage && "[&_.ProseMirror]:text-destructive",
      )}
    />
  );
}
