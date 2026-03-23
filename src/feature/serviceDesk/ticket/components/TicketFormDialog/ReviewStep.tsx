import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { DatePicker } from "@/components/custom/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/domain/serviceDesk";
import {
  MAX_ATTACH_COUNT,
  MAX_ATTACH_SIZE,
  MAX_EMAIL_COUNT,
} from "@/feature/serviceDesk/ticket/types/constants";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import { ImageValueLabel, ValueLabel } from "@/shared/types";
import { camelCase } from "@/shared/utils";

import { useTicketFormContext } from "../../context/TicketFormContext";
import { TicketFormValues } from "../../forms/ticket";
import { AttachmentList } from "./AttachmentStep";
import { useAttachments } from "./AttachmentStep/useAttachments";

const EMAIL_FIELDS = ["email.to", "email.cc", "email.bcc"] as const;
type EmailFieldName = (typeof EMAIL_FIELDS)[number];

export const ReviewStep = () => {
  const { form, categories, users } = useTicketFormContext();

  const { t } = useTranslation("serviceDesk");
  const tLocal = useLocalizedText();

  const { files, totalSizeMB } = useAttachments({
    form,
    fileField: "attachment",
    maxCount: MAX_ATTACH_COUNT,
    maxSizeMB: MAX_ATTACH_SIZE,
  });

  const [requestTemplate, setRequestTemplate] = useState<string>("");

  const categoryData = useMemo(
    (): Array<{
      category: ValueLabel;
      subCategories: ValueLabel[];
    }> =>
      categories.map((category) => ({
        category: {
          value: category.id,
          label: tLocal(category.name),
        },
        subCategories: category.subCategories.map((sub) => ({
          value: sub.id,
          label: tLocal(sub.name),
        })),
      })),
    [categories, tLocal],
  );

  const onChangeTemplate = (subCatId: string) => {
    const subCategories = [] as Category[];

    for (const category of categories) {
      subCategories.concat(category.subCategories);
    }

    const selected = subCategories.find((subCat) => subCat.id === subCatId);

    setRequestTemplate(
      selected?.requestTemplate !== undefined
        ? tLocal(selected?.requestTemplate)
        : "",
    );
  };
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="info-step-select-category">
          {t("field.category.label", { ns: "common" })}
        </FieldLabel>

        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <Select
              onValueChange={(subCat) => {
                field.onChange(subCat);
                onChangeTemplate(subCat);
              }}
            >
              <SelectTrigger id="info-step-select-category" value={field.value}>
                <SelectValue placeholder={t("placeholder.category")} />
              </SelectTrigger>

              <SelectContent>
                {categoryData.map((group) => (
                  <SelectGroup key={group.category.value}>
                    <SelectLabel className="bg-muted/50 text-xs rounded">
                      {group.category.label}
                    </SelectLabel>

                    {group.subCategories.map((sub) => (
                      <SelectItem
                        key={sub.value}
                        value={sub.value}
                        className="text-xs ml-2"
                      >
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="info-step-input-due-date">
          {t("field.dueDate", { ns: "common" })}
        </FieldLabel>

        <Controller
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <DatePicker
              id="info-step-input-due-date"
              value={field.value}
              onChange={(date) => field.onChange(date ?? new Date())}
            />
          )}
        />
      </Field>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
            {t("field.email.label", { ns: "common" })}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Field>
            {EMAIL_FIELDS.map((fieldName) => (
              <EmailField
                key={fieldName}
                control={form.control}
                emailFieldName={fieldName}
                users={users}
              />
            ))}
          </Field>
        </CollapsibleContent>
      </Collapsible>

      <Field>
        <FieldLabel htmlFor="info-step-input-subject">
          {t("field.subject", { ns: "common" })}
        </FieldLabel>

        <Controller
          control={form.control}
          name="subject"
          render={({ field }) => (
            <Input
              id="info-step-input-subject"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="info-step-input-body">
          {t("field.body", { ns: "common" })}
        </FieldLabel>

        <Controller
          control={form.control}
          name="body"
          render={({ field }) => (
            <Input
              id="info-step-input-body"
              value={field.value}
              onChange={field.onChange}
              placeholder={requestTemplate}
            />
          )}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="info-step-input-body">
          {t("field.attach", { ns: "common" })}
        </FieldLabel>

        <AttachmentList
          files={files}
          totalSizeMB={totalSizeMB}
          maxCount={MAX_ATTACH_COUNT}
          maxSize={MAX_ATTACH_SIZE}
        />
      </Field>
    </FieldGroup>
  );
};

type EmailFieldProps = {
  control: Control<TicketFormValues>;
  emailFieldName: EmailFieldName;
  users: ImageValueLabel[];
};

const EmailField = ({ control, emailFieldName, users }: EmailFieldProps) => {
  const { t } = useTranslation("serviceDesk");

  const localeField = camelCase(emailFieldName.replace(".", "_"));

  return (
    <Controller
      control={control}
      name={emailFieldName}
      render={({ field }) => (
        <AvatarMultiComboBox
          id={`info-step-select-${localeField}`}
          placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
          variant="ghost"
          badgeVariant="primary"
          options={users}
          value={field.value ?? []}
          maxImages={MAX_EMAIL_COUNT}
          placeholder={t(`field.${localeField}.placeholder`, {
            ns: NS.common,
          })}
          onSelect={(value) => field.onChange([...(field.value ?? []), value])}
          onRemove={(selected) =>
            field.onChange(
              (field.value ?? []).filter((value) => value !== selected),
            )
          }
        />
      )}
    />
  );
};
