import { useEffect, useMemo, useRef } from "react";
import type { DateRange } from "react-day-picker";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SearchDateFilter } from "@/components/custom/DatePicker";
import { Field, FieldLabel } from "@/components/ui/field";
import type { DueDate } from "@/domain/common";
import { NS } from "@/lib/i18n";

import type { TicketSearchCriteriaFormValues } from "../../forms/searchCriteria";
import { convertDueDate } from "../../utils";
import { createTicketDueByOptions } from "./options";

type Props = {
  control: Control<TicketSearchCriteriaFormValues>;
};

type TicketDueByInputValue = {
  type: DueDate;
  dateRange: DateRange | undefined;
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
  const nextTypeRef = useRef<DueDate>(value.type);

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
      resolveRange={convertDueDate}
      rangeValue="range"
    />
  );
}

export function TicketDueByField({ control }: Props) {
  const { t } = useTranslation(NS.serviceDesk);
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
