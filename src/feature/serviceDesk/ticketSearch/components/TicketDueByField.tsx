import {
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
} from "date-fns";
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
  dateRange?: DateRange;
};

const ALL_DUE_BY_VALUE: TicketDueByInputValue = {
  type: "all",
  dateRange: undefined,
};

const convertDueAtToDateRange = (value: dueAt): DateRange | undefined => {
  const now = new Date();
  const from = startOfDay(now);

  switch (value) {
    case "today":
      return { from, to: endOfDay(now) };

    case "this_week":
      return { from, to: endOfWeek(now, { weekStartsOn: 1 }) };

    case "this_2week":
      return {
        from,
        to: endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
      };

    case "this_month":
      return { from, to: endOfMonth(now) };

    case "within_week":
      return { from, to: endOfDay(addWeeks(now, 1)) };

    case "within_2week":
      return { from, to: endOfDay(addWeeks(now, 2)) };

    case "within_month":
      return { from, to: endOfDay(addMonths(now, 1)) };

    case "overdue":
      return { from: startOfDay(addYears(now, -1)), to: endOfDay(now) };
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
  value?: TicketDueByInputValue;
  onChange: (value?: TicketDueByInputValue) => void;
  options: ReturnType<typeof createTicketDueByOptions>;
}) {
  const safeValue: TicketDueByInputValue = value ?? ALL_DUE_BY_VALUE;
  const nextTypeRef = useRef<dueAt>(safeValue.type);

  useEffect(() => {
    nextTypeRef.current = safeValue.type;
  }, [safeValue.type]);

  return (
    <SearchDateFilter
      value={safeValue.type}
      onValueChange={(selected) => {
        nextTypeRef.current = selected ?? safeValue.type;
        if (nextTypeRef.current === "all") {
          onChange(ALL_DUE_BY_VALUE);
          return;
        }

        onChange({
          type: selected ?? safeValue.type,
          dateRange: safeValue.dateRange,
        });
      }}
      range={safeValue.dateRange}
      onRangeChange={(selected) => {
        const nextType = nextTypeRef.current ?? safeValue.type;

        if (nextType === "all") {
          onChange(ALL_DUE_BY_VALUE);
          return;
        }

        onChange({
          type: nextType,
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
            value={field.value as TicketDueByInputValue | undefined}
            onChange={field.onChange}
            options={dueByOptions}
          />
        )}
      />
    </Field>
  );
}
