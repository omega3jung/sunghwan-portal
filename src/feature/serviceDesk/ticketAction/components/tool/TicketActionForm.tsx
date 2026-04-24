import type { Editor } from "@tiptap/react";
import { useMemo } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FileAttachment } from "@/components/custom/FileAttachment";
import {
  actionRichEditorPreset,
  RichEditor,
} from "@/components/custom/RichEditor";
import { getRichEditorLabels } from "@/components/custom/RichEditor/labels";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import type { MainCategory } from "@/domain/serviceDesk";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/core/constants";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";

import type { TicketActionDraftFormValues } from "../../forms";
import type { TicketActionMode } from "../../types";
import { AdjustFields } from "./actionFormFields/AdjustFields";
import { AssignFields } from "./actionFormFields/AssignFields";
import { MergeFields } from "./actionFormFields/MergeFields";
import {
  EDITOR_PLACEHOLDER_KEY,
  getFieldClassName,
  getFieldGroupClassName,
  getFieldLabel,
  setActionFieldValue,
} from "./utils";

type TicketActionFormProps = {
  ticketId: string;
  originalCategoryId?: string;
  mode: TicketActionMode;
  form: UseFormReturn<TicketActionDraftFormValues>;
  onEditorReady?: (editor: Editor | null) => void;
  categories?: MainCategory[];
  users?: ImageValueLabel[];
};

export function TicketActionForm({
  ticketId,
  originalCategoryId,
  mode,
  form,
  onEditorReady = () => undefined,
  categories = [],
  users = [],
}: TicketActionFormProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();

  const content = useWatch({ control: form.control, name: "content" });
  const errorMessageKey =
    typeof form.formState.errors.content?.message === "string"
      ? form.formState.errors.content.message
      : "";
  const errorMessage = errorMessageKey ? t(errorMessageKey) : "";
  const toolbarLabels = useMemo(() => getRichEditorLabels(t), [t]);

  return (
    <FieldGroup className={getFieldGroupClassName(mode)}>
      {mode === "assign" ? (
        <AssignFields
          form={form}
          originalCategoryId={originalCategoryId}
          categories={categories}
          users={users}
          t={t}
          tLocal={tLocal}
        />
      ) : null}

      {mode === "adjust" ? <AdjustFields form={form} t={t} /> : null}

      {mode === "merge" ? (
        <MergeFields ticketId={ticketId} form={form} t={t} />
      ) : null}

      <Field
        className={getFieldClassName(mode)}
        data-invalid={Boolean(errorMessage)}
      >
        <FieldLabel>{getFieldLabel(mode, t)}</FieldLabel>
        <RichEditor
          value={content}
          preset={actionRichEditorPreset}
          placeholder={t(EDITOR_PLACEHOLDER_KEY[mode])}
          error={errorMessage}
          minHeight={160}
          className="rounded-lg border-border/50 bg-background"
          onChange={(value) => {
            setActionFieldValue(form, "content", value);
          }}
          onEditorReady={onEditorReady}
          toolbarLabels={toolbarLabels}
        />
        <FieldError>{errorMessage}</FieldError>
      </Field>

      <Field>
        <FileAttachment
          form={form}
          name="attachment"
          className={getFieldClassName(mode)}
          maxCount={MAX_ATTACH_COUNT}
          maxSizeMB={MAX_ATTACH_SIZE}
        />
      </Field>
    </FieldGroup>
  );
}
