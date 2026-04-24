import { addMonths, addWeeks, endOfDay, endOfMonth, endOfWeek } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import { DateRange } from "react-day-picker";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SearchDateFilter } from "@/components/custom/DatePicker";
import { Field, FieldLabel } from "@/components/ui/field";
import { dueAt } from "@/domain/common";
import { NS } from "@/lib/i18n";

import type { TicketSearchCriteriaFormValues } from "../forms";
import { createTicketDueByOptions } from "./options";

type Props = {
  control: Control<TicketSearchCriteriaFormValues>;
};

type TicketDueByInputValue = {
  type: dueAt;
  dateRange: DateRange | undefined;
};

const convertDueAtToDateRange = (value: dueAt): DateRange | undefined => {
  const now = new Date();

  switch (value) {
    case "today":
      return { from: now, to: endOfDay(now) };

    case "this_week":
      return { from: now, to: endOfWeek(now, { weekStartsOn: 1 }) };

    case "this_2week":
      return {
        from: now,
        to: endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
      };

    case "this_month":
      return { from: now, to: endOfMonth(now) };

    case "within_week":
      return { from: now, to: addWeeks(now, 1) };

    case "within_2week":
      return { from: now, to: addWeeks(now, 2) };

    case "within_month":
      return { from: now, to: new Date(addMonths(now, 1)) };

    case "overdue":
    case "all":
    default:
      return undefined;
  }
};

function TicketDueByFieldInput({
  value,
  onChange,
  options,
}: {
  value: TicketDueByInputValue;
  onChange: (value: TicketDueByInputValue) => void;
  options: ReturnType<typeof createTicketDueByOptions>;
}) {
  const nextTypeRef = useRef<dueAt>(value.type);

  useEffect(() => {
    nextTypeRef.current = value.type;
  }, [value.type]);

  return (
    <SearchDateFilter
      value={value.type}
      onValueChange={(selected) => {
        nextTypeRef.current = selected ?? value.type;
        onChange({
          type: selected ?? value.type,
          dateRange: value.dateRange,
        });
      }}
      range={value.dateRange}
      onRangeChange={(selected) => {
        onChange({
          type: nextTypeRef.current ?? value.type,
          dateRange: selected,
        });
      }}
      showTextType="all"
      options={options}
      resolveRange={convertDueAtToDateRange}
      rangeValue="range"
    />
  );
}

export function TicketDueByField({ control }: Props) {
  const { t } = useTranslation(NS.common);
  const { t: tDomain } = useTranslation(NS.domain);

  const dueByOptions = useMemo(
    () => createTicketDueByOptions(tDomain),
    [tDomain],
  );

  return (
    <Field>
      <FieldLabel htmlFor="ticket-search-select-dueBy">
        {t("field.dueBy")}
      </FieldLabel>
      <Controller
        control={control}
        name="dueBy"
        render={({ field }) => (
          <TicketDueByFieldInput
            value={field.value as TicketDueByInputValue}
            onChange={field.onChange}
            options={dueByOptions}
          />
        )}
      />
    </Field>
  );
}
