"use client";

import { addDays, endOfToday, format, startOfToday } from "date-fns";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarComboBox";
import { DatePicker } from "@/components/custom/DatePicker";
import { HierarchicalSelect } from "@/components/custom/HierarchicalSelect";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MAX_EMAIL_COUNT } from "@/feature/serviceDesk/ticket/constants";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import {
  formatTicketCategoryPath,
  mapTicketCategoriesToHierarchicalItems,
  resolveTicketCategoryMeta,
} from "@/feature/serviceDesk/ticket/utils/categorySelection";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks/useLocalizedValue";
import type { ImageValueLabel } from "@/shared/types";
import { camelCase } from "@/shared/utils/value";

import { useTicketCreateFormContext } from "../../context/TicketCreateFormContext";

const EMAIL_FIELDS = ["email.to", "email.cc", "email.bcc"] as const;
type EmailFieldName = (typeof EMAIL_FIELDS)[number];

type TicketInfoFieldsProps = {
  mode?: "edit" | "view";
};

export const TicketInfoFields = ({ mode = "edit" }: TicketInfoFieldsProps) => {
  const { form, categories, users } = useTicketCreateFormContext();

  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText();
  const [mindueAt, setMindueAt] = useState<Date>(new Date());

  const isViewMode = mode === "view";
  const categoryValue = form.watch("category");
  const dueAtValue = form.watch("dueAt");
  const subjectValue = form.watch("subject");

  const resolveCategoryMeta = useCallback(
    (categoryId?: string | null) =>
      resolveTicketCategoryMeta(categories, categoryId),
    [categories],
  );

  const categoryDisplayValue = useMemo(() => {
    if (!categoryValue) {
      return "-";
    }

    return formatTicketCategoryPath(
      resolveCategoryMeta(categoryValue),
      tLocal,
      categoryValue,
    );
  }, [categoryValue, resolveCategoryMeta, tLocal]);

  const dueAtDisplayValue = dueAtValue ? format(dueAtValue, "PPP") : "-";

  const items = useMemo(
    () => mapTicketCategoriesToHierarchicalItems(categories, tLocal),
    [categories, tLocal],
  );

  useEffect(() => {
    if (isViewMode) {
      return;
    }

    const { selected, parentCategory } = resolveCategoryMeta(categoryValue);
    const slaDays =
      selected?.defaultSlaDays ?? parentCategory?.defaultSlaDays ?? 0;
    const nextMindueAt = addDays(startOfToday(), slaDays);

    setMindueAt((prev) =>
      prev.getTime() === nextMindueAt.getTime() ? prev : nextMindueAt,
    );
  }, [categories, categoryValue, isViewMode, resolveCategoryMeta]);

  const handleCategoryChange = (
    subCatId: string,
    onChange: (value: string) => void,
  ) => {
    onChange(subCatId);

    if (isViewMode) {
      return;
    }

    const { selected, parentCategory } = resolveCategoryMeta(subCatId);
    const slaDays =
      selected?.defaultSlaDays ?? parentCategory?.defaultSlaDays ?? 1;
    const priority =
      selected?.defaultPriority ?? parentCategory?.defaultPriority ?? null;
    const riskLevel =
      selected?.defaultRiskLevel ?? parentCategory?.defaultRiskLevel ?? null;

    form.setValue("dueAt", addDays(endOfToday(), slaDays));
    form.setValue("priority", priority);
    form.setValue("riskLevel", riskLevel);
    setMindueAt(addDays(startOfToday(), slaDays));
  };

  return (
    <FieldGroup className="min-w-0">
      <Collapsible>
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:gap-4">
          <Field className="min-w-0 gap-1 md:flex-1">
            <FieldLabel htmlFor="ticket-info-select-category">
              {t("field.category", { ns: "common" })}
            </FieldLabel>

            {isViewMode ? (
              <ReadOnlyValue>{categoryDisplayValue}</ReadOnlyValue>
            ) : (
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <HierarchicalSelect
                    id="ticket-info-select-category"
                    value={field.value ?? null}
                    items={items}
                    placeholder={t("ticketCreate.category.placeholder")}
                    backLabel={t("ticketCreate.category.back")}
                    emptyText={t("ticketCreate.category.empty")}
                    selectableStrategy="parent-without-children"
                    onValueChange={(categoryId) =>
                      handleCategoryChange(categoryId, field.onChange)
                    }
                    getDisplayLabel={(_, path) =>
                      path.map((item) => item.label).join(" / ")
                    }
                  />
                )}
              />
            )}
          </Field>

          <Field className="min-w-0 gap-1 md:w-72 md:shrink-0 lg:w-80">
            <FieldLabel htmlFor="ticket-info-input-due-date">
              {t("field.dueAt", { ns: "common" })}
            </FieldLabel>

            {isViewMode ? (
              <ReadOnlyValue>{dueAtDisplayValue}</ReadOnlyValue>
            ) : (
              <Controller
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <DatePicker
                    id="ticket-info-input-due-date"
                    className="h-9"
                    value={field.value}
                    onChange={(date) => field.onChange(date ?? new Date())}
                    minDate={mindueAt}
                  />
                )}
              />
            )}
          </Field>

          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group h-9 w-full justify-between transition-none hover:bg-accent hover:text-accent-foreground md:w-auto md:justify-start"
            >
              {t("field.email", { ns: "common" })}
              <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="min-w-0 pt-2">
          <Field className="min-w-0">
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
  <div className="flex min-h-9 min-w-0 items-center rounded-md border border-input bg-muted/20 px-3 py-2 text-sm break-words">
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
