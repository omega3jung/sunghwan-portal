import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SearchDateFilter } from "@/components/custom/DatePicker";
import { Field, FieldLabel } from "@/components/ui/field";
import type { DueDate } from "@/domain/common";
import { NS } from "@/lib/i18n";

import type { TicketSearchCriteriaFormValues } from "../../forms/searchCriteria";
import { createTicketDueByOptions } from "./options";

type Props = {
  control: Control<TicketSearchCriteriaFormValues>;
};

export function TicketDueByField({ control }: Props) {
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tDomain } = useTranslation("domain");

  const dueByOptions = useMemo(
    () => createTicketDueByOptions(tDomain),
    [tDomain],
  );

  return (
    <Field>
      <FieldLabel htmlFor="ticket-search-select-dueBy">
        {t("general.dueBy")}
      </FieldLabel>
      <Controller
        control={control}
        name="dueBy"
        render={({ field }) => (
          <SearchDateFilter
            value={field.value.type as DueDate}
            onValueChange={(selected) => {
              field.onChange({
                type: selected ?? field.value.type,
                dateRange: field.value.dateRange,
              });
            }}
            range={field.value.dateRange as DateRange | undefined}
            onRangeChange={(selected) => {
              field.onChange({
                type: field.value.type,
                dateRange: selected,
              });
            }}
            showRangeText={true}
            options={dueByOptions}
            rangeValue="range"
          />
        )}
      />
    </Field>
  );
}
