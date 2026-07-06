"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  descriptionRichEditorPreset,
  RichEditor,
} from "@/components/custom/RichEditor";
import { getRichEditorLabels } from "@/components/custom/RichEditor/labels";
import { Field, FieldLabel } from "@/components/ui/field";
import { getTicketCategoryRequestTemplate } from "@/feature/serviceDesk/ticket/utils/categorySelection";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";

import { useTicketCreateFormContext } from "../../context/TicketCreateFormContext";
import { TicketInfoFields } from "./InfoFields";
import { RemoteAttachmentNotice } from "./RemoteAttachmentNotice";

const IMAGE_TAG_PATTERN = /<img\b/i;

export const InfoStep = () => {
  const { form, categories } = useTicketCreateFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText();
  const bodyValue = useWatch({ control: form.control, name: "body" });
  const categoryValue = useWatch({ control: form.control, name: "category" });
  const toolbarLabels = useMemo(() => getRichEditorLabels(t), [t]);
  const hasAttachedImage = IMAGE_TAG_PATTERN.test(bodyValue ?? "");

  const requestTemplate = useMemo(() => {
    return getTicketCategoryRequestTemplate(
      categories,
      categoryValue,
      tLocal,
    );
  }, [categories, categoryValue, tLocal]);

  return (
    <>
      <TicketInfoFields mode="edit" />

      <Field className="min-w-0 gap-1 pt-4">
        <FieldLabel htmlFor="info-step-input-description">
          {t("field.description", { ns: "common" })}
        </FieldLabel>

        <div className="min-w-0 space-y-2">
          <RichEditor
            id="info-step-input-description"
            value={bodyValue}
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
              });
            }}
            toolbarLabels={toolbarLabels}
          />

          <RemoteAttachmentNotice isVisible={hasAttachedImage}>
            {t("ticketDraft.notice.remoteImagesReplaced")}
          </RemoteAttachmentNotice>
        </div>
      </Field>
    </>
  );
};
