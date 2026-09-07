"use client";

import { FileText, ImageIcon, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FileAttachment } from "@/components/custom/FileAttachment";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { TicketAttachmentMetadata } from "@/domain/serviceDesk";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
  TICKET_ATTACHMENT_ACCEPT,
} from "@/feature/serviceDesk/ticket/constants";
import { NS } from "@/lib/application/i18n";
import { bytesToKB } from "@/shared/utils/browser";

import { useTicketUpdateFormContext } from "../../context/TicketUpdateFormContext";
import { RemoteAttachmentNotice } from "./RemoteNotices";

export function AttachmentStep() {
  const {
    form,
    existingFiles,
    existingImages,
    onRemoveExistingFile,
    onRemoveExistingImage,
  } = useTicketUpdateFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const newAttachments =
    useWatch({ control: form.control, name: "attachment" }) ?? [];

  return (
    <FieldGroup className="min-w-0">
      <ExistingAttachmentSection
        items={existingImages}
        label={t("ticketUpdate.field.existingImages")}
        icon={<ImageIcon className="h-4 w-4" />}
        onRemove={onRemoveExistingImage}
        image
      />

      <ExistingAttachmentSection
        items={existingFiles}
        label={t("ticketUpdate.field.existingFiles")}
        icon={<FileText className="h-4 w-4" />}
        onRemove={onRemoveExistingFile}
      />

      <Field className="min-w-0">
        <FieldLabel>{t("ticketUpdate.field.newAttachments")}</FieldLabel>
        <FileAttachment
          form={form}
          name="attachment"
          maxCount={MAX_ATTACH_COUNT}
          maxSizeMB={MAX_ATTACH_SIZE}
          accept={TICKET_ATTACHMENT_ACCEPT}
        />
        <RemoteAttachmentNotice isVisible={newAttachments.length > 0}>
          {t("ticketUpdate.notice.remoteFilesReplaced")}
        </RemoteAttachmentNotice>
      </Field>
    </FieldGroup>
  );
}

type ExistingAttachmentSectionProps = {
  items: TicketAttachmentMetadata[];
  label: string;
  icon: ReactNode;
  onRemove: (index: number) => void;
  image?: boolean;
};

function ExistingAttachmentSection({
  items,
  label,
  icon,
  onRemove,
  image = false,
}: ExistingAttachmentSectionProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Field className="min-w-0">
      <FieldLabel>{label}</FieldLabel>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          {t("ticketUpdate.empty.existingAttachments")}
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((item, index) => (
            <Attachment
              key={`${item.replacedName}-${index}`}
              className="w-full flex-nowrap rounded-md"
            >
              <AttachmentMedia variant={image ? "image" : "icon"}>
                {image ? (
                  <img
                    src={item.demoUrl}
                    alt={item.originalName}
                  />
                ) : (
                  icon
                )}
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{item.originalName}</AttachmentTitle>
                <AttachmentDescription>
                  {bytesToKB(item.size)} KB
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  type="button"
                  size="icon"
                  className="text-destructive"
                  aria-label={`${t("action.delete", { ns: NS.common })}: ${item.originalName}`}
                  onClick={() => onRemove(index)}
                >
                  <Trash2 />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          ))}
        </div>
      )}
    </Field>
  );
}
