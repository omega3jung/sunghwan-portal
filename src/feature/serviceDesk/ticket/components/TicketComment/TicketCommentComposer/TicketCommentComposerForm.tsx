import { type Editor } from "@tiptap/react";

import { TicketCommentEditor } from "../TicketCommentEditor";
import type { TicketCommentComposerMode } from "./TicketCommentComposer";
import { TicketCommentComposerFooter } from "./TicketCommentComposerFooter";
import { TicketCommentComposerHeader } from "./TicketCommentComposerHeader";
import { TicketCommentComposerToolbar } from "./TicketCommentComposerToolbar";

type TicketCommentComposerFormProps = {
  open: boolean;
  currentUserEmail: string;
  currentUserImage?: string;
  currentUserName: string;
  editor: Editor | null;
  errorMessage: string;
  helperText: string;
  isPending: boolean;
  mode: Exclude<TicketCommentComposerMode, "toolbar">;
  showHeader?: boolean;
  onCancel: () => void;
  onEditorReady: (editor: Editor | null) => void;
  onModeChange: (mode: Exclude<TicketCommentComposerMode, "toolbar">) => void;
  onSubmit: () => void;
  onTextChange: (hasText: boolean) => void;
  submitLabel: string;
};

export function TicketCommentComposerForm({
  open,
  currentUserEmail,
  currentUserImage,
  currentUserName,
  editor,
  errorMessage,
  helperText,
  isPending,
  mode,
  showHeader = true,
  onCancel,
  onEditorReady,
  onModeChange,
  onSubmit,
  onTextChange,
  submitLabel,
}: TicketCommentComposerFormProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/50 p-4">
      <TicketCommentComposerHeader
        currentUserEmail={currentUserEmail}
        currentUserImage={currentUserImage}
        currentUserName={currentUserName}
        helperText={helperText}
        mode={mode}
        showHeader={showHeader}
        onModeChange={onModeChange}
      />

      <div className="rounded-lg border border-border/50 bg-background">
        <TicketCommentComposerToolbar editor={editor} />
        <TicketCommentEditor
          mode={mode}
          errorMessage={errorMessage}
          onEditorReady={onEditorReady}
          onTextChange={onTextChange}
        />
      </div>

      <TicketCommentComposerFooter
        disabled={!editor || isPending}
        errorMessage={errorMessage}
        helperText={helperText}
        isPending={isPending}
        submitLabel={submitLabel}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
}
