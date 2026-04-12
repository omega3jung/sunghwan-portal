import { useEffect, useRef } from "react";
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

type TicketPeriodInputValue = {
  type: DateRangePreset;
  dateRange: DateRange | undefined;
};

function TicketPeriodFieldInput({
  value,
  onChange,
}: {
  value: TicketPeriodInputValue;
  onChange: (value: TicketPeriodInputValue) => void;
}) {
  const nextTypeRef = useRef<DateRangePreset>(value.type);

  useEffect(() => {
    nextTypeRef.current = value.type;
  }, [value.type]);

  return (
    <DateRangePicker
      period={value.type}
      onPeriodChange={(selected) => {
        nextTypeRef.current = selected ?? value.type;
        onChange({
          type: selected ?? value.type,
          dateRange: value.dateRange,
        });
      }}
      range={value.dateRange}
      onRangeChange={(selected) => {
        onChange({
          type: nextTypeRef.current,
          dateRange: selected,
        });
      }}
      showTextType="all"
      options={TICKET_PERIOD_OPTIONS}
    />
  );
}

export function TicketPeriodField({ control }: Props) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Field>
      <FieldLabel htmlFor="ticket-search-select-period">
        {t("field.period", { ns: NS.common })}
      </FieldLabel>
      <Controller
        control={control}
        name="period"
        render={({ field }) => (
          <TicketPeriodFieldInput
            value={field.value as TicketPeriodInputValue}
            onChange={field.onChange}
          />
        )}
      />
    </Field>
  );
}
