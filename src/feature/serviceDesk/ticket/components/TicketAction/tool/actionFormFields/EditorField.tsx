import type { Editor } from "@tiptap/react";

import { Field, FieldLabel } from "@/components/ui/field";

import { TicketActionRichTextEditor } from "../TicketActionRichTextEditor";
import { TicketActionRichTextToolbar } from "../TicketActionRichTextToolbar";
import { EDITOR_PLACEHOLDER_KEY, type TicketActionFormMode } from "./utils";

type EditorFieldProps = {
  mode: TicketActionFormMode;
  label: string;
  className?: string;
  editor?: Editor | null;
  errorMessage?: string;
  content?: string;
  onEditorReady?: (editor: Editor | null) => void;
  onTextChange?: (hasText: boolean) => void;
  onContentChange?: (value: string) => void;
};

export function EditorField({
  mode,
  label,
  className,
  editor = null,
  errorMessage = "",
  content,
  onEditorReady = () => undefined,
  onTextChange = () => undefined,
  onContentChange,
}: EditorFieldProps) {
  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <div className="rounded-lg border border-border/50 bg-background">
        <TicketActionRichTextToolbar editor={editor} />
        <TicketActionRichTextEditor
          placeholderKey={EDITOR_PLACEHOLDER_KEY[mode]}
          errorMessage={errorMessage}
          content={content}
          onEditorReady={onEditorReady}
          onTextChange={onTextChange}
          onContentChange={onContentChange}
        />
      </div>
    </Field>
  );
}
