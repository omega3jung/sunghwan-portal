import { type Editor } from "@tiptap/react";
import {
  Bold,
  Code2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";

type TicketCommentComposerToolbarProps = {
  editor: Editor | null;
};

export function TicketCommentComposerToolbar({
  editor,
}: TicketCommentComposerToolbarProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border/50 p-2">
      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.bold")}
        active={editor?.isActive("bold")}
        onClick={() => {
          editor?.chain().focus().toggleBold().run();
        }}
      >
        <Bold className="h-4 w-4" />
      </EditorToolbarButton>
      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.italic")}
        active={editor?.isActive("italic")}
        onClick={() => {
          editor?.chain().focus().toggleItalic().run();
        }}
      >
        <Italic className="h-4 w-4" />
      </EditorToolbarButton>
      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.bulletList")}
        active={editor?.isActive("bulletList")}
        onClick={() => {
          editor?.chain().focus().toggleBulletList().run();
        }}
      >
        <List className="h-4 w-4" />
      </EditorToolbarButton>
      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.numberedList")}
        active={editor?.isActive("orderedList")}
        onClick={() => {
          editor?.chain().focus().toggleOrderedList().run();
        }}
      >
        <ListOrdered className="h-4 w-4" />
      </EditorToolbarButton>
      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.quote")}
        active={editor?.isActive("blockquote")}
        onClick={() => {
          editor?.chain().focus().toggleBlockquote().run();
        }}
      >
        <Quote className="h-4 w-4" />
      </EditorToolbarButton>
      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.codeBlock")}
        active={editor?.isActive("codeBlock")}
        onClick={() => {
          editor?.chain().focus().toggleCodeBlock().run();
        }}
      >
        <Code2 className="h-4 w-4" />
      </EditorToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.undo")}
        onClick={() => {
          editor?.chain().focus().undo().run();
        }}
      >
        <Undo2 className="h-4 w-4" />
      </EditorToolbarButton>
      <EditorToolbarButton
        editor={editor}
        label={t("comment.toolbar.redo")}
        onClick={() => {
          editor?.chain().focus().redo().run();
        }}
      >
        <Redo2 className="h-4 w-4" />
      </EditorToolbarButton>
    </div>
  );
}

function EditorToolbarButton({
  active,
  children,
  editor,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  editor: Editor | null;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn(
        "h-8 w-8 rounded-md hover:bg-muted/40",
        active && "bg-muted text-foreground",
      )}
      onClick={onClick}
      disabled={!editor}
    >
      {children}
    </Button>
  );
}
