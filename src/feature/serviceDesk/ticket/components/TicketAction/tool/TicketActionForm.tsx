import type { Editor } from "@tiptap/react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FieldGroup } from "@/components/ui/field";
import type { MainCategory } from "@/domain/serviceDesk";
import { AttachmentField } from "@/feature/serviceDesk/ticket/components/attachments";
import type { TicketActionDraftFormValues } from "@/feature/serviceDesk/ticket/forms/action";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/types/constants";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";

import { AdjustFields } from "./actionFormFields/AdjustFields";
import { AssignFields } from "./actionFormFields/AssignFields";
import { EditorField } from "./actionFormFields/EditorField";
import { MergeFields } from "./actionFormFields/MergeFields";
import {
  getFieldClassName,
  getFieldGroupClassName,
  getFieldLabel,
  type TicketActionFormMode,
} from "./utils";

type TicketActionFormProps = {
  ticketId: string;
  originalCategoryId?: string;
  mode: TicketActionFormMode;
  form: UseFormReturn<TicketActionDraftFormValues>;
  editor?: Editor | null;
  onEditorReady?: (editor: Editor | null) => void;
  categories?: MainCategory[];
  users?: ImageValueLabel[];
};

export function TicketActionForm({
  ticketId,
  originalCategoryId,
  mode,
  form,
  editor = null,
  onEditorReady = () => undefined,
  categories = [],
  users = [],
}: TicketActionFormProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();

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

      <EditorField
        form={form}
        mode={mode}
        className={getFieldClassName(mode)}
        label={getFieldLabel(mode, t)}
        editor={editor}
        onEditorReady={onEditorReady}
      />

      <AttachmentField
        form={form}
        name="attachment"
        className={getFieldClassName(mode)}
        maxCount={MAX_ATTACH_COUNT}
        maxSizeMB={MAX_ATTACH_SIZE}
      />
    </FieldGroup>
  );
}
