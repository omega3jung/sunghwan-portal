"use client";

import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import type { Control, UseFormReturn } from "react-hook-form";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SupportedLanguage } from "@/domain/config";
import type { MainCategory } from "@/domain/serviceDesk";
import { MAX_EMAIL_COUNT } from "@/feature/serviceDesk/ticket/constants";
import type { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import {
  mapTicketCategoriesToHierarchicalItems,
} from "@/feature/serviceDesk/ticket/utils/categorySelection";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";
import { camelCase } from "@/shared/utils/value";

const EMAIL_FIELDS = ["email.to", "email.cc", "email.bcc"] as const;
type EmailFieldName = (typeof EMAIL_FIELDS)[number];

type UpdateTicketInfoFieldsProps = {
  form: UseFormReturn<TicketFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
  language: SupportedLanguage;
};

export function UpdateTicketInfoFields({
  form,
  categories,
  users,
  language,
}: UpdateTicketInfoFieldsProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText(language);
  const categoryError = form.formState.errors.category?.message;
  const subjectError = form.formState.errors.subject?.message;
  const dueAtError = form.formState.errors.dueAt?.message;
  const items = useMemo(
    () => mapTicketCategoriesToHierarchicalItems(categories, tLocal),
    [categories, tLocal],
  );

  return (
    <FieldGroup className="min-w-0">
      <Collapsible>
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-end md:gap-4">
          <Field
            className="min-w-0 gap-1 md:flex-1"
            data-invalid={categoryError ? true : undefined}
          >
            <FieldLabel htmlFor="ticket-update-select-category">
              {t("field.category", { ns: NS.common })}
            </FieldLabel>

            <Controller
              control={form.control}
              name="category"
              render={({ field }) => (
                <HierarchicalSelect
                  id="ticket-update-select-category"
                  value={field.value ?? null}
                  items={items}
                  placeholder={t("ticketUpdate.category.placeholder")}
                  backLabel={t("ticketUpdate.category.back")}
                  emptyText={t("ticketUpdate.category.empty")}
                  selectableStrategy="parent-without-children"
                  onValueChange={field.onChange}
                  getDisplayLabel={(_, path) =>
                    path.map((item) => item.label).join(" / ")
                  }
                />
              )}
            />
            <ValidationError message={categoryError} />
          </Field>

          <Field
            className="min-w-0 gap-1 md:w-72 md:shrink-0 lg:w-80"
            data-invalid={dueAtError ? true : undefined}
          >
            <FieldLabel htmlFor="ticket-update-input-due-date">
              {t("field.dueAt", { ns: NS.common })}
            </FieldLabel>

            <Controller
              control={form.control}
              name="dueAt"
              render={({ field }) => (
                <DatePicker
                  id="ticket-update-input-due-date"
                  className="h-9"
                  value={field.value}
                  onChange={(date) => field.onChange(date ?? field.value)}
                />
              )}
            />
            <ValidationError message={dueAtError} />
          </Field>

          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="group h-9 w-full justify-between md:w-auto md:justify-start"
            >
              {t("field.email", { ns: NS.common })}
              <ChevronRight className="transition-transform group-data-[state=open]:rotate-90" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="min-w-0 pt-2">
          <Field className="min-w-0">
            {EMAIL_FIELDS.map((fieldName) => (
              <UpdateTicketEmailField
                key={fieldName}
                control={form.control}
                emailFieldName={fieldName}
                users={users}
              />
            ))}
          </Field>
        </CollapsibleContent>
      </Collapsible>

      <Field className="gap-1" data-invalid={subjectError ? true : undefined}>
        <FieldLabel htmlFor="ticket-update-input-subject">
          {t("field.subject", { ns: NS.common })}
        </FieldLabel>
        <Controller
          control={form.control}
          name="subject"
          render={({ field }) => (
            <Input
              id="ticket-update-input-subject"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <ValidationError message={subjectError} count={200} />
      </Field>
    </FieldGroup>
  );
}

type UpdateTicketEmailFieldProps = {
  control: Control<TicketFormValues>;
  emailFieldName: EmailFieldName;
  users: ImageValueLabel[];
};

function UpdateTicketEmailField({
  control,
  emailFieldName,
  users,
}: UpdateTicketEmailFieldProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const localeField = camelCase(emailFieldName.replace(".", "_"));

  return (
    <Controller
      control={control}
      name={emailFieldName}
      render={({ field }) => (
        <AvatarMultiComboBox
          id={`ticket-update-select-${localeField}`}
          placeholderClassName="h-8 font-normal flex items-center pl-2 text-muted-foreground"
          variant="ghost"
          badgeVariant="primary"
          options={users}
          value={field.value ?? []}
          maxImages={MAX_EMAIL_COUNT}
          placeholder={t(`field.${localeField}`, { ns: NS.common })}
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
