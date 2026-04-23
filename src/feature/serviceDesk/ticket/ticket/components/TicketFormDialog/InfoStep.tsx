import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  descriptionRichEditorPreset,
  RichEditor,
} from "@/components/custom/RichEditor";
import { getRichEditorLabels } from "@/components/custom/RichEditor/labels";
import { Field, FieldLabel } from "@/components/ui/field";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";

import { useTicketFormContext } from "../../context/TicketFormContext";
import { TicketInfoFields } from "./InfoFields";

export const InfoStep = () => {
  const { form, categories } = useTicketFormContext();
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText();
  const bodyValue = form.watch("body");
  const subCategoryValue = form.watch("subCategory");
  const toolbarLabels = useMemo(() => getRichEditorLabels(t), [t]);

  const requestTemplate = useMemo(() => {
    const subCategories = categories.flatMap(
      (category) => category.subCategories,
    );
    const selected = subCategories.find(
      (subCat) => subCat.id === subCategoryValue,
    );

    return selected?.requestTemplate !== undefined
      ? tLocal(selected.requestTemplate)
      : "";
  }, [categories, subCategoryValue, tLocal]);

  return (
    <>
      <TicketInfoFields mode="edit" />

      <Field className="pt-4 gap-1">
        <FieldLabel htmlFor="info-step-input-description">
          {t("field.description", { ns: "common" })}
        </FieldLabel>

        <div className="space-y-2">
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
        </div>
      </Field>
    </>
  );
};
