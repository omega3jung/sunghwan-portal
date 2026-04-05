import { Separator } from "@radix-ui/react-separator";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import { Field, FieldLabel } from "@/components/ui/field";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/types/constants";
import { NS } from "@/lib/i18n";

import { useTicketFormContext } from "../../context/TicketFormContext";
import { MarkdownPreview } from "../MarkdownPreview";
import { AttachmentList } from "./AttachmentStep";
import { useAttachments } from "./AttachmentStep/useAttachments";
import { TicketInfoFields } from "./TicketInfoFields";

export const ReviewStep = () => {
  const { form } = useTicketFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const bodyValue = form.watch("body");
  const { files, totalSizeMB } = useAttachments({
    form,
    fileField: "attachment",
    maxCount: MAX_ATTACH_COUNT,
    maxSizeMB: MAX_ATTACH_SIZE,
  });

  return (
    <>
      <TicketInfoFields mode="view" />

      <Field className="pt-4 gap-1">
        <FieldLabel htmlFor="review-step-body-preview">
          {t("field.description", { ns: "common" })}
        </FieldLabel>

        <MarkdownPreview value={bodyValue} />
      </Field>

      <Field>
        <Separator className="mb-4 mt-6 h-0.5 bg-border" />

        <AttachmentList
          files={files}
          totalSizeMB={totalSizeMB}
          maxCount={MAX_ATTACH_COUNT}
          maxSize={MAX_ATTACH_SIZE}
        />
      </Field>
    </>
  );
};
