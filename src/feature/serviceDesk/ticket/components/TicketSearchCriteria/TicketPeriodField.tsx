import type { DateRange } from "react-day-picker";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { DateRangePicker } from "@/components/custom/DatePicker";
import { Field, FieldLabel } from "@/components/ui/field";
import { NS } from "@/lib/i18n";
import type { DateRangePreset } from "@/shared/types";

import type { TicketSearchCriteriaFormValues } from "../../forms/searchCriteria";
import { TICKET_PERIOD_OPTIONS } from "./options";

type Props = {
  control: Control<TicketSearchCriteriaFormValues>;
};

export function TicketPeriodField({ control }: Props) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Field>
      <FieldLabel htmlFor="ticket-search-select-period">
        {t("general.period")}
      </FieldLabel>
      <Controller
        control={control}
        name="period"
        render={({ field }) => (
          <DateRangePicker
            period={field.value.type as DateRangePreset}
            onPeriodChange={(selected) => {
              field.onChange({
                type: selected,
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
            options={TICKET_PERIOD_OPTIONS}
          />
        )}
      />
    </Field>
  );
}
