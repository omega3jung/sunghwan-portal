"use client";

import { FileText, ImageIcon, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FileAttachment } from "@/components/custom/FileAttachment";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { TicketAttachmentMetadata } from "@/domain/serviceDesk";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
  TICKET_ATTACHMENT_ACCEPT,
} from "@/feature/serviceDesk/ticket/constants";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import { NS } from "@/lib/i18n";
import { bytesToKB } from "@/shared/utils/browser";

type AttachmentStepProps = {
  form: UseFormReturn<TicketFormValues>;
  existingFiles: TicketAttachmentMetadata[];
  existingImages: TicketAttachmentMetadata[];
  isRemoteMode: boolean;
  onRemoveExistingFile: (index: number) => void;
  onRemoveExistingImage: (index: number) => void;
};

export function AttachmentStep({
  form,
  existingFiles,
  existingImages,
  isRemoteMode,
  onRemoveExistingFile,
  onRemoveExistingImage,
}: AttachmentStepProps) {
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
        <UpdateRemoteAttachmentNotice
          isVisible={isRemoteMode && newAttachments.length > 0}
        >
          {t("ticketUpdate.notice.remoteFilesReplaced")}
        </UpdateRemoteAttachmentNotice>
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
    <Field className="min-w-0 gap-2">
      <FieldLabel>{label}</FieldLabel>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          {t("ticketUpdate.empty.existingAttachments")}
        </div>
      ) : (
        <div className="grid gap-2">
          {items.map((item, index) => (
            <div
              key={`${item.replacedName}-${index}`}
              className="flex min-w-0 items-center gap-3 rounded-md border px-3 py-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                {image ? (
                  <img
                    src={item.demoUrl}
                    alt={item.originalName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  icon
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {item.originalName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {bytesToKB(item.size)} KB
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Field>
  );
}

type UpdateRemoteAttachmentNoticeProps = {
  isVisible: boolean;
  children: ReactNode;
};

function UpdateRemoteAttachmentNotice({
  isVisible,
  children,
}: UpdateRemoteAttachmentNoticeProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm leading-5 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200">
      {children}
    </div>
  );
}
