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
import {
  priorityOptions,
  riskLevelOptions,
} from "@/feature/serviceDesk/shared";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useLocalizedText } from "@/shared/hooks";
import type { ImageValueLabel } from "@/shared/types";
import { getStatusOptions } from "@/shared/ui/StatusBadge/options";
import type { SystemStatus } from "@/shared/ui/StatusBadge/types";

import type { TicketSearchCriteriaFormValues } from "../forms";
import { createTicketCategoryOptions } from "./options";
import { TicketDueByField } from "./TicketDueByField";
import { TicketPeriodField } from "./TicketPeriodField";
import { appendUnique, removeValue } from "./utils";

type Props = {
  form: UseFormReturn<TicketSearchCriteriaFormValues>;
  categories: MainCategory[];
  users: ImageValueLabel[];
};

const statusBadgeOrderByValue: Record<SystemStatus, number> = {
  Draft: 7,
  Open: 5,
  Reopen: 4,
  Approved: 1,
  Declined: 3,
  Working: 4,
  Pending: 6,
  Resolved: 2,
  Rejected: 3,
  Closed: 0,
};

export function TicketSearchCriteriaFields({ form, categories, users }: Props) {
  const { current: userPreference } = useCurrentPreference();
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const tLocal = useLocalizedText(userPreference.language);

  const statusOptions = useMemo(
    () => getStatusOptions(userPreference.language),
    [userPreference.language],
  );

  const categoryOptions = useMemo<TreeMultiComboBoxOption[]>(
    () => createTicketCategoryOptions(categories, tLocal),
    [categories, tLocal],
  );
  const statusBadgeOrderMap = useMemo(
    () =>
      new Map(
        statusOptions.map((option, index) => [
          option.value,
          statusBadgeOrderByValue[option.value] ?? index,
        ]),
      ),
    [statusOptions],
  );

  return (
    <FieldSet className="gap-10">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {t("searchCriteria.primaryFilters")}
        </h3>
        <div className="rounded-lg rounded-tl-none border border-border/60 border-t-2 bg-muted/[0.18] p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="ticket-search-select-category">
                {tCommon("field.category")}
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
                    placeholder={t("placeholder.select", {
                      ns: NS.common,
                      target: tCommon("field.category"),
                    })}
                  />
                )}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ticket-search-select-status">
                {tCommon("field.status")}
              </FieldLabel>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <MultiComboBox
                    id="ticket-search-select-status"
                    badgeVariant="palette"
                    badgeOrderMap={statusBadgeOrderMap}
                    paletteStart={10}
                    options={statusOptions}
                    value={field.value}
                    onSelect={(selected) => {
                      field.onChange(appendUnique(field.value, selected));
                    }}
                    onRemove={(selected) => {
                      field.onChange(removeValue(field.value, selected));
                    }}
                    placeholder={t("placeholder.select", {
                      ns: NS.common,
                      target: tCommon("field.status"),
                    })}
                    {...form.register("status")}
                  />
                )}
              />
            </Field>
          </FieldGroup>
        </div>
      </div>
      <FieldGroup className="gap-5">
        <div className="border-b-2 border-border/60">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            {t("searchCriteria.additionalFilters")}
          </h3>
        </div>
        <Field>
          <FieldLabel htmlFor="ticket-search-select-priority">
            {tCommon("field.priority")}
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
                placeholder={t("placeholder.select", {
                  ns: NS.common,
                  target: tCommon("field.priority"),
                })}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-risk">
            {tCommon("field.riskLevel")}
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
                placeholder={t("placeholder.select", {
                  ns: NS.common,
                  target: tCommon("field.riskLevel"),
                })}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-assignee">
            {tCommon("field.assignee")}
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
                placeholder={t("placeholder.select", {
                  ns: NS.common,
                  target: tCommon("field.assignee"),
                })}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="ticket-search-select-requester">
            {tCommon("field.requester")}
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
                placeholder={t("placeholder.select", {
                  ns: NS.common,
                  target: tCommon("field.requester"),
                })}
              />
            )}
          />
        </Field>
        <div className="pt-4 border-t border-border/60" />
      </FieldGroup>
      <FieldGroup className="gap-5">
        <div className="pt-2 border-b-2 border-border/60">
          <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            {t("searchCriteria.dateFilters")}
          </h3>
        </div>
        <TicketPeriodField control={form.control} />
        <TicketDueByField control={form.control} />
      </FieldGroup>
    </FieldSet>
  );
}
