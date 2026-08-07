"use client";

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
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import type { DatePickerProps } from "./types";
import {
  formatDateText,
  isCalendarDateDisabled,
  normalizeDateValue,
} from "./utils";

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  className,
  variant = "outline",
  size = "lg",
  modal = true,
  ...buttonProps
}: DatePickerProps) {
  const { t } = useTranslation(NS.component, {
    keyPrefix: "datePicker",
  });

  const [open, setOpen] = useState(false);
  const normalizedDate = normalizeDateValue(value);
  const normalizedMinDate = normalizeDateValue(minDate);
  const normalizedMaxDate = normalizeDateValue(maxDate);

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger
        render={
          <Button
          {...buttonProps}
          variant={variant}
          size={size}
          className={cn(
            "w-full justify-between border-slate-150 bg-transparent px-3 font-normal text-basic hover:bg-transparent hover:text-basic [&>span]:truncate",
            !normalizedDate && "text-muted-foreground",
            className,
          )}
          />
        }
      >
          {normalizedDate ? (
            <span>{formatDateText(normalizedDate)}</span>
          ) : (
            <span>{t("placeholder")}</span>
          )}
          <CalendarIcon className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={normalizedDate}
          defaultMonth={normalizedDate}
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
