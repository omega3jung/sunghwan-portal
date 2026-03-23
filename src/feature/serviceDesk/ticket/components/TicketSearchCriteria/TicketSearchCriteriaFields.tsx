import { useMemo } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import {
  MultiComboBox,
  TreeMultiComboBox,
  type TreeMultiComboBoxOption,
} from "@/components/custom/MultiComboBox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import type { MainCategory } from "@/domain/serviceDesk";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";
import { getStatusOptions } from "@/shared/ui/StatusBadge/options";

import { priorityOptions, riskLevelOptions } from "../../../shared/options";
import type { TicketSearchCriteriaFormValues } from "../../forms/searchCriteria";
import { createTicketCategoryOptions } from "./options";
import { TicketDueByField } from "./TicketDueByField";
import { TicketPeriodField } from "./TicketPeriodField";
import { appendUnique, removeValue } from "./utils";

type Props = {
  form: UseFormReturn<TicketSearchCriteriaFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
};

export function TicketSearchCriteriaFields({
  form,
  categories,
  users,
}: Props) {
  const { current: userPreference } = useCurrentPreference();
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedText(userPreference.language);

  const statusOptions = useMemo(
    () => getStatusOptions(userPreference.language),
    [userPreference.language],
  );

  const categoryOptions = useMemo<TreeMultiComboBoxOption[]>(
    () => createTicketCategoryOptions(categories, tLocal),
    [categories, tLocal],
  );

  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="ticket-search-select-category">
            {t("general.category")}
          </FieldLabel>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <TreeMultiComboBox
                id="ticket-search-select-category"
                badgeVariant="palette"
                paletteStart={9}
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-status">
            {t("general.status")}
          </FieldLabel>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <MultiComboBox
                id="ticket-search-select-status"
                badgeVariant="palette"
                paletteStart={4}
                options={statusOptions}
                value={field.value}
                onSelect={(selected) => {
                  field.onChange(appendUnique(field.value, selected));
                }}
                onRemove={(selected) => {
                  field.onChange(removeValue(field.value, selected));
                }}
                {...form.register("status")}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-priority">
            {t("general.priority")}
          </FieldLabel>
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <MultiComboBox
                id="ticket-search-select-priority"
                badgeVariant="palette"
                paletteStart={9}
                options={priorityOptions}
                value={field.value}
                onSelect={(selected) => {
                  field.onChange(appendUnique(field.value, selected));
                }}
                onRemove={(selected) => {
                  field.onChange(removeValue(field.value, selected));
                }}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-risk">
            {t("general.risk")}
          </FieldLabel>
          <Controller
            control={form.control}
            name="riskLevel"
            render={({ field }) => (
              <MultiComboBox
                id="ticket-search-select-risk"
                badgeVariant="palette"
                paletteStart={9}
                options={riskLevelOptions}
                value={field.value}
                onSelect={(selected) => {
                  field.onChange(appendUnique(field.value, selected));
                }}
                onRemove={(selected) => {
                  field.onChange(removeValue(field.value, selected));
                }}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-assignee">
            {t("general.assignee")}
          </FieldLabel>
          <Controller
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <AvatarMultiComboBox
                value={field.value}
                options={users}
                onSelect={(selected) => {
                  field.onChange(appendUnique(field.value, selected));
                }}
                onRemove={(selected) => {
                  field.onChange(removeValue(field.value, selected));
                }}
                maxImages={3}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-requester">
            {t("general.requester")}
          </FieldLabel>
          <Controller
            control={form.control}
            name="requester"
            render={({ field }) => (
              <AvatarMultiComboBox
                value={field.value}
                options={users}
                onSelect={(selected) => {
                  field.onChange(appendUnique(field.value, selected));
                }}
                onRemove={(selected) => {
                  field.onChange(removeValue(field.value, selected));
                }}
                maxImages={3}
              />
            )}
          />
        </Field>

        <TicketPeriodField control={form.control} />
        <TicketDueByField control={form.control} />
      </FieldGroup>
    </FieldSet>
  );
}
