import { addDays, endOfToday, format, startOfToday } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { TicketFormValues } from "@/feature/serviceDesk/ticket/forms/ticket";
import { MAX_EMAIL_COUNT } from "@/feature/serviceDesk/ticket/types/constants";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import { ImageValueLabel, ValueLabel } from "@/shared/types";
import { camelCase } from "@/shared/utils";

import { useTicketFormContext } from "../../context/TicketFormContext";

const EMAIL_FIELDS = ["email.to", "email.cc", "email.bcc"] as const;
type EmailFieldName = (typeof EMAIL_FIELDS)[number];

type TicketInfoFieldsProps = {
  mode?: "edit" | "view";
};

type CategoryMeta = {
  selected?: {
    defaultPriority?: string | null;
    defaultRiskLevel?: string | null;
    defaultSlaDays?: number;
  };
  parentCategory?: {
    id: string;
  };
};

export const TicketInfoFields = ({ mode = "edit" }: TicketInfoFieldsProps) => {
  const { form, categories, users } = useTicketFormContext();

  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText();
  const [minDueDate, setMinDueDate] = useState<Date>(new Date());

  const isViewMode = mode === "view";
  const subCategoryValue = form.watch("subCategory");
  const dueDateValue = form.watch("dueDate");
  const subjectValue = form.watch("subject");

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

  const resolveCategoryMeta = (subCatId?: string): CategoryMeta => {
    const subCategories = categories.flatMap(
      (category) => category.subCategories,
    );

    const selected = subCategories.find((subCat) => subCat.id === subCatId);
    const parentCategory = categories.find((category) =>
      category.subCategories.some((subCat) => subCat.id === subCatId),
    );

    return {
      selected,
      parentCategory,
    };
  };

  const categoryDisplayValue = useMemo(() => {
    if (!subCategoryValue) {
      return "-";
    }

    const { parentCategory } = resolveCategoryMeta(subCategoryValue);
    const matchedParent = categories.find(
      (category) => category.id === parentCategory?.id,
    );

    const parentLabel = matchedParent ? tLocal(matchedParent.name) : null;
    const selectedLabel =
      categoryData
        .flatMap((group) => group.subCategories)
        .find((sub) => sub.value === subCategoryValue)?.label ??
      subCategoryValue;

    return parentLabel ? `${parentLabel} / ${selectedLabel}` : selectedLabel;
  }, [categories, categoryData, subCategoryValue, tLocal]);

  const dueDateDisplayValue = dueDateValue ? format(dueDateValue, "PPP") : "-";

  useEffect(() => {
    if (isViewMode) {
      return;
    }

    const { selected } = resolveCategoryMeta(subCategoryValue);
    const nextMinDueDate = addDays(
      startOfToday(),
      selected?.defaultSlaDays ?? 0,
    );

    setMinDueDate((prev) =>
      prev.getTime() === nextMinDueDate.getTime() ? prev : nextMinDueDate,
    );
  }, [categories, isViewMode, subCategoryValue]);

  const handleCategoryChange = (
    subCatId: string,
    onChange: (value: string) => void,
  ) => {
    onChange(subCatId);

    if (isViewMode) {
      return;
    }

    const { selected, parentCategory } = resolveCategoryMeta(subCatId);
    const slaDays = selected?.defaultSlaDays ?? 0;

    form.setValue("mainCategory", parentCategory?.id);
    form.setValue("dueDate", addDays(endOfToday(), slaDays));
    form.setValue("priority", selected?.defaultPriority ?? null);
    form.setValue("riskLevel", selected?.defaultRiskLevel ?? null);
    setMinDueDate(addDays(startOfToday(), slaDays));
  };

  return (
    <FieldGroup>
      <Collapsible>
        <div className="flex items-end gap-4">
          <Field className="col-span-3 gap-1">
            <FieldLabel htmlFor="ticket-info-select-category">
              {t("field.category", { ns: "common" })}
            </FieldLabel>

            {isViewMode ? (
              <ReadOnlyValue>{categoryDisplayValue}</ReadOnlyValue>
            ) : (
              <Controller
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={(subCat) =>
                      handleCategoryChange(subCat, field.onChange)
                    }
                  >
                    <SelectTrigger id="ticket-info-select-category">
                      <SelectValue
                        placeholder={t("placeholder.select", {
                          target: t("field.category", { ns: NS.common }),
                          ns: NS.common,
                        })}
                      />
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
            )}
          </Field>

          <Field className="w-80 gap-1">
            <FieldLabel htmlFor="ticket-info-input-due-date">
              {t("field.dueDate", { ns: "common" })}
            </FieldLabel>

            {isViewMode ? (
              <ReadOnlyValue>{dueDateDisplayValue}</ReadOnlyValue>
            ) : (
              <Controller
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    id="ticket-info-input-due-date"
                    className="h-9"
                    value={field.value}
                    onChange={(date) => field.onChange(date ?? new Date())}
                    minDate={minDueDate}
                  />
                )}
              />
            )}
          </Field>

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group h-9 w-20 justify-start transition-none hover:bg-accent hover:text-accent-foreground"
            >
              {t("field.email", { ns: "common" })}
              <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="pt-2">
          <Field>
            {EMAIL_FIELDS.map((fieldName) => (
              <EmailField
                key={fieldName}
                control={form.control}
                emailFieldName={fieldName}
                users={users}
                readOnly={isViewMode}
              />
            ))}
          </Field>
        </CollapsibleContent>
      </Collapsible>

      <Field className="gap-1">
        <FieldLabel htmlFor="ticket-info-input-subject">
          {t("field.subject", { ns: "common" })}
        </FieldLabel>

        <Controller
          control={form.control}
          name="subject"
          render={({ field }) =>
            isViewMode ? (
              <ReadOnlyValue>{subjectValue || "-"}</ReadOnlyValue>
            ) : (
              <Input
                id="ticket-info-input-subject"
                value={field.value}
                onChange={field.onChange}
              />
            )
          }
        />
      </Field>
    </FieldGroup>
  );
};

const ReadOnlyValue = ({ children }: { children: string }) => (
  <div className="flex min-h-9 items-center rounded-md border border-input bg-muted/20 px-3 py-2 text-sm">
    {children}
  </div>
);

type EmailFieldProps = {
  control: Control<TicketFormValues>;
  emailFieldName: EmailFieldName;
  users: ImageValueLabel[];
  readOnly: boolean;
};

const EmailField = ({
  control,
  emailFieldName,
  users,
  readOnly,
}: EmailFieldProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  const localeField = camelCase(emailFieldName.replace(".", "_"));

  return (
    <Controller
      control={control}
      name={emailFieldName}
      render={({ field }) => (
        <AvatarMultiComboBox
          id={`ticket-info-select-${localeField}`}
          placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
          variant="ghost"
          badgeVariant="primary"
          options={users}
          value={field.value ?? []}
          maxImages={MAX_EMAIL_COUNT}
          placeholder={t(`field.${localeField}`, { ns: NS.common })}
          readOnly={readOnly}
          onSelect={
            readOnly
              ? undefined
              : (value) => field.onChange([...(field.value ?? []), value])
          }
          onRemove={
            readOnly
              ? undefined
              : (selected) =>
                  field.onChange(
                    (field.value ?? []).filter((value) => value !== selected),
                  )
          }
        />
      )}
    />
  );
};
