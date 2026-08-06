"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  descriptionRichEditorPreset,
  RichEditor,
} from "@/components/custom/RichEditor";
import { getRichEditorLabels } from "@/components/custom/RichEditor/labels";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { getTicketCategoryRequestTemplate } from "@/feature/serviceDesk/ticket/utils/categorySelection";
import { NS } from "@/lib/application/i18n";
import { useLocalizedText } from "@/lib/client/i18n";

import { useTicketUpdateFormContext } from "../../context/TicketUpdateFormContext";
import { UpdateTicketInfoFields } from "./InfoFields";
import { RemoteAttachmentNotice } from "./RemoteNotices";

const IMAGE_TAG_PATTERN = /<img\b/i;

export function InfoStep() {
  const { form, categories, language } = useTicketUpdateFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText(language);
  const body = useWatch({ control: form.control, name: "body" });
  const category = useWatch({ control: form.control, name: "category" });
  const bodyError = form.formState.errors.body?.message;
  const toolbarLabels = useMemo(() => getRichEditorLabels(t), [t]);
  const requestTemplate = useMemo(
    () => getTicketCategoryRequestTemplate(categories, category, tLocal),
    [categories, category, tLocal],
  );
  const hasInlineImage = IMAGE_TAG_PATTERN.test(body ?? "");

  return (
    <>
      <UpdateTicketInfoFields />

      <Field
        className="min-w-0 gap-1 pt-4"
        data-invalid={bodyError ? true : undefined}
      >
        <FieldLabel htmlFor="ticket-update-input-description">
          {t("field.description", { ns: NS.common })}
        </FieldLabel>

        <div className="min-w-0 space-y-2">
          <RichEditor
            id="ticket-update-input-description"
            value={body}
            preset={descriptionRichEditorPreset}
            placeholder={requestTemplate}
            minHeight={208}
            className="bg-transparent"
            contentClassName="px-3 py-2"
            onChange={(value) => {
              if (value === form.getValues("body")) {
                return;
              }

              form.setValue("body", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            toolbarLabels={toolbarLabels}
          />
          <ValidationError message={bodyError} />
          <RemoteAttachmentNotice isVisible={hasInlineImage}>
            {t("ticketUpdate.notice.remoteImagesReplaced")}
          </RemoteAttachmentNotice>
        </div>
      </Field>
    </>
  );
}

type ValidationErrorProps = {
  message?: string;
  count?: number;
};

function ValidationError({ message, count }: ValidationErrorProps) {
  const { t } = useTranslation(NS.validation);

  if (!message) {
    return null;
  }

  return <FieldError>{t(message, { count })}</FieldError>;
}
