import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FileAttachment } from "@/components/custom/FileAttachment";
import {
  actionRichEditorPreset,
  RichEditor,
  type RichEditorPreset,
} from "@/components/custom/RichEditor";
import { getRichEditorLabels } from "@/components/custom/RichEditor/labels";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import type { MainCategory } from "@/domain/serviceDesk";
import type { TicketAssignmentPhase } from "@/domain/serviceDesk";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
  TICKET_ATTACHMENT_ACCEPT,
} from "@/feature/serviceDesk/ticket/constants";
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

const IMAGE_TAG_PATTERN = /<img\b/i;
const approvalActionRichEditorPreset: RichEditorPreset = {
  ...actionRichEditorPreset,
  toolbar: actionRichEditorPreset.toolbar
    .map((group) => group.filter((item) => item !== "image"))
    .filter((group) => group.length > 0),
};

type TicketActionFormProps = {
  ticketId: string;
  originalCategoryId?: string;
  assignmentPhase?: TicketAssignmentPhase;
  isRemoteMode?: boolean;
  mode: TicketActionMode;
  form: UseFormReturn<TicketActionDraftFormValues>;
  onEditorReady?: (editor: Editor | null) => void;
  categories?: MainCategory[];
  users?: ImageValueLabel[];
};

export function TicketActionForm({
  ticketId,
  originalCategoryId,
  assignmentPhase = "WORK",
  isRemoteMode = false,
  mode,
  form,
  onEditorReady = () => undefined,
  categories = [],
  users = [],
}: TicketActionFormProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue();

  const content = useWatch({ control: form.control, name: "content" });
  const attachments = useWatch({ control: form.control, name: "attachment" });
  const errorMessageKey =
    typeof form.formState.errors.content?.message === "string"
      ? form.formState.errors.content.message
      : "";
  const errorMessage = errorMessageKey ? t(errorMessageKey) : "";
  const toolbarLabels = useMemo(() => getRichEditorLabels(t), [t]);
  const supportsAttachment = mode !== "approve" && mode !== "decline";
  const editorPreset = supportsAttachment
    ? actionRichEditorPreset
    : approvalActionRichEditorPreset;
  const hasAttachedImage = IMAGE_TAG_PATTERN.test(content ?? "");
  const hasAttachedFiles = supportsAttachment && (attachments?.length ?? 0) > 0;

  return (
    <FieldGroup className={getFieldGroupClassName(mode)}>
      {mode === "assign" ? (
        <AssignFields
          form={form}
          originalCategoryId={originalCategoryId}
          assignmentPhase={assignmentPhase}
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
          preset={editorPreset}
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
        <RemoteAttachmentNotice
          isRemoteMode={isRemoteMode}
          isVisible={supportsAttachment && hasAttachedImage}
        >
          {t("ticketDraft.notice.remoteImagesReplaced")}
        </RemoteAttachmentNotice>
        <FieldError>{errorMessage}</FieldError>
      </Field>

      {supportsAttachment ? (
        <Field className={getFieldClassName(mode)}>
          <FileAttachment
            form={form}
            name="attachment"
            maxCount={MAX_ATTACH_COUNT}
            maxSizeMB={MAX_ATTACH_SIZE}
            accept={TICKET_ATTACHMENT_ACCEPT}
          />
          <RemoteAttachmentNotice
            isRemoteMode={isRemoteMode}
            isVisible={hasAttachedFiles}
          >
            {t("ticketDraft.notice.remoteFilesReplaced")}
          </RemoteAttachmentNotice>
        </Field>
      ) : null}
    </FieldGroup>
  );
}

type RemoteAttachmentNoticeProps = {
  children: ReactNode;
  isRemoteMode: boolean;
  isVisible: boolean;
};

const RemoteAttachmentNotice = ({
  children,
  isRemoteMode,
  isVisible,
}: RemoteAttachmentNoticeProps) => {
  if (!isRemoteMode || !isVisible) {
    return null;
  }

  return (
    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm leading-5 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200">
      {children}
    </div>
  );
};
