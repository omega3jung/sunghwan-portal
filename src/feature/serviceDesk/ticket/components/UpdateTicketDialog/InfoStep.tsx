"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  descriptionRichEditorPreset,
  RichEditor,
} from "@/components/custom/RichEditor";
import { getRichEditorLabels } from "@/components/custom/RichEditor/labels";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { SupportedLanguage } from "@/domain/config";
import type { MainCategory } from "@/domain/serviceDesk";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import { getTicketCategoryRequestTemplate } from "@/feature/serviceDesk/ticket/utils/categorySelection";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";

import { UpdateTicketInfoFields } from "./InfoFields";

const IMAGE_TAG_PATTERN = /<img\b/i;

type InfoStepProps = {
  form: UseFormReturn<TicketFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
  language: SupportedLanguage;
  isRemoteMode: boolean;
};

export function InfoStep({
  form,
  categories,
  users,
  language,
  isRemoteMode,
}: InfoStepProps) {
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
      <UpdateTicketInfoFields
        form={form}
        categories={categories}
        users={users}
        language={language}
      />

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
          <UpdateRemoteAttachmentNotice
            isVisible={isRemoteMode && hasInlineImage}
          >
            {t("ticketUpdate.notice.remoteImagesReplaced")}
          </UpdateRemoteAttachmentNotice>
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
