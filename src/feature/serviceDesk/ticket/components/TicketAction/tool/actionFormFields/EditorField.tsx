import type { Editor } from "@tiptap/react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { TicketActionDraftFormValues } from "@/feature/serviceDesk/ticket/forms/action";
import { NS } from "@/lib/i18n";

import { TicketActionRichTextEditor } from "../TicketActionRichTextEditor";
import { TicketActionRichTextToolbar } from "../TicketActionRichTextToolbar";
import {
  EDITOR_PLACEHOLDER_KEY,
  setActionFieldValue,
  type TicketActionFormMode,
} from "../utils";

type EditorFieldProps = {
  form: UseFormReturn<TicketActionDraftFormValues>;
  mode: TicketActionFormMode;
  label: string;
  className?: string;
  editor?: Editor | null;
  onEditorReady?: (editor: Editor | null) => void;
};

export function EditorField({
  form,
  mode,
  label,
  className,
  editor = null,
  onEditorReady = () => undefined,
}: EditorFieldProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const onContentChange = (value: string) => {
    setActionFieldValue(form, "content", value);
  };

  const content = useWatch({ control: form.control, name: "content" });
  const errorMessageKey =
    typeof form.formState.errors.content?.message === "string"
      ? form.formState.errors.content.message
      : "";
  const errorMessage = errorMessageKey ? t(errorMessageKey) : "";

  return (
    <Field className={className} data-invalid={Boolean(errorMessage)}>
      <FieldLabel>{label}</FieldLabel>
      <div className="rounded-lg border border-border/50 bg-background">
        <TicketActionRichTextToolbar editor={editor} />
        <TicketActionRichTextEditor
          placeholderKey={EDITOR_PLACEHOLDER_KEY[mode]}
          errorMessage={errorMessage}
          content={content}
          onEditorReady={onEditorReady}
          onTextChange={() => undefined}
          onContentChange={onContentChange}
        />
      </div>
      <FieldError>{errorMessage}</FieldError>
    </Field>
  );
}
