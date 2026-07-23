import { Separator } from "@radix-ui/react-separator";
import { useTranslation } from "react-i18next";

import {
  FileAttachmentList,
  useFileAttachments,
} from "@/components/custom/FileAttachment";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
} from "@/feature/serviceDesk/ticket/constants";
import { NS } from "@/lib/application/i18n";

import { useTicketCreateFormContext } from "../../context/TicketCreateFormContext";
import { TicketInfoFields } from "./InfoFields";

export const ReviewStep = () => {
  const { form } = useTicketCreateFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const bodyValue = form.watch("body");
  const { files, totalFileSizeMB } = useFileAttachments({
    form,
    name: "attachment",
    maxCount: MAX_ATTACH_COUNT,
    maxSizeMB: MAX_ATTACH_SIZE,
  });

  return (
    <>
      <TicketInfoFields mode="view" />

      <Field className="min-w-0 gap-1 pt-4">
        <FieldLabel htmlFor="review-step-body-preview">
          {t("field.description", { ns: "common" })}
        </FieldLabel>

        <div className="max-w-full overflow-x-auto">
          <div
            id="review-step-body-preview"
            className="prose prose-sm min-h-52 min-w-0 max-w-none break-words rounded-md border border-input bg-transparent px-3 py-2 text-foreground prose-a:text-primary prose-img:max-w-full prose-img:rounded-lg prose-p:my-3 prose-p:leading-6 prose-pre:max-w-full prose-pre:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: bodyValue || "<p>-</p>" }}
          />
        </div>
      </Field>

      <Field>
        <Separator className="mb-4 mt-6 h-0.5 bg-border" />

        <FileAttachmentList
          files={files}
          totalFileSizeMB={totalFileSizeMB}
          maxCount={MAX_ATTACH_COUNT}
          maxSizeMB={MAX_ATTACH_SIZE}
        />
      </Field>
    </>
  );
};
