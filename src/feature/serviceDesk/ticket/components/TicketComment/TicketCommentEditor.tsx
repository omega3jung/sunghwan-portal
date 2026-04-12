"use client";

import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";

import type { TicketCommentComposerMode } from "./TicketCommentComposer/TicketCommentComposer";

type TicketCommentEditorProps = {
  mode: Exclude<TicketCommentComposerMode, "toolbar">;
  errorMessage: string;
  onEditorReady: (editor: Editor | null) => void;
  onTextChange: (hasText: boolean) => void;
};

export function TicketCommentEditor({
  mode,
  errorMessage,
  onEditorReady,
  onTextChange,
}: TicketCommentEditorProps) {
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
    },
  });

  useEffect(() => {
    placeholderRef.current =
      mode === "internal"
        ? t("comment.editor.placeholderInternal")
        : t("comment.editor.placeholderPublic");

    if (editor?.isEmpty) {
      editor.view.dispatch(editor.state.tr);
    }
  }, [editor, mode, t]);

  useEffect(() => {
    onEditorReady(editor);

    return () => {
      onEditorReady(null);
    };
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
