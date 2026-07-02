"use client";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FileAttachment } from "@/components/custom/FileAttachment";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
  TICKET_ATTACHMENT_ACCEPT,
} from "@/feature/serviceDesk/ticket/constants";
import { NS } from "@/lib/i18n";

import { useTicketFormContext } from "../../context/TicketFormContext";
import { RemoteAttachmentNotice } from "./RemoteAttachmentNotice";

export const AttachmentStep = () => {
  const { form } = useTicketFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const attachments = useWatch({ control: form.control, name: "attachment" });
  const hasAttachedFiles = (attachments?.length ?? 0) > 0;

  return (
    <FieldGroup className="min-w-0">
      <Field className="min-w-0">
        <FileAttachment
          form={form}
          name="attachment"
          maxCount={MAX_ATTACH_COUNT}
          maxSizeMB={MAX_ATTACH_SIZE}
          accept={TICKET_ATTACHMENT_ACCEPT}
        />
      </Field>

      <RemoteAttachmentNotice isVisible={hasAttachedFiles}>
        {t("ticketDraft.notice.remoteFilesReplaced")}
      </RemoteAttachmentNotice>
    </FieldGroup>
  );
};
