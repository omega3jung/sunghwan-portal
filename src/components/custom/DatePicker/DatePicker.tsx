"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/shared/utils";

import type { DatePickerProps } from "./types";
import {
  formatDateText,
  isCalendarDateDisabled,
  normalizeDateValue,
} from "./utils";

export function DatePicker({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  className,
  variant = "outline",
  size = "lg",
  ...buttonProps
}: DatePickerProps) {
  const { t } = useTranslation("DatePicker");

  const [open, setOpen] = useState(false);
  const [date, setDate] = useControllableState<Date | undefined>({
    prop: value,
    defaultProp: defaultValue,
    onChange,
  });
  const normalizedDate = normalizeDateValue(date);
  const normalizedDefaultValue = normalizeDateValue(defaultValue);
  const normalizedMinDate = normalizeDateValue(minDate);
  const normalizedMaxDate = normalizeDateValue(maxDate);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          {...buttonProps}
          variant={variant}
          size={size}
          className={cn(
            "w-full justify-between border-slate-150 bg-transparent px-3 font-normal text-basic hover:bg-transparent hover:text-basic [&>span]:truncate",
            !normalizedDate && "text-muted-foreground",
            className,
          )}
        >
          {normalizedDate ? (
            <span>{formatDateText(normalizedDate)}</span>
          ) : (
            <span>{t("placeholder")}</span>
          )}
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={normalizedDate}
          defaultMonth={normalizedDate ?? normalizedDefaultValue}
          onSelect={handleSelect}
          disabled={(calendarDate) =>
            isCalendarDateDisabled(
              calendarDate,
              normalizedMinDate,
              normalizedMaxDate,
            )
          }
        />
      </PopoverContent>
    </Popover>
  );
}
