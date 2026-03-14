// this component needs expanding

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import * as datefns from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, ButtonProps } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/shared/utils";

type DatePickerProps = {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date?: Date) => void;
  minDate?: Date;
  maxDate?: Date;
} & Omit<ButtonProps, "value" | "onChange">;

export function DatePicker({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  className,
  ...buttonProps
}: DatePickerProps) {
  const { t } = useTranslation("DatePicker");

  const [open, setOpen] = useState(false);
  const [date, setDate] = useControllableState<Date | undefined>({
    prop: value,
    defaultProp: defaultValue,
    onChange,
  });

  const handleSelect = (date: Date | undefined) => {
    setDate(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          {...buttonProps}
          className={cn(
            "border-slate-150 flex h-8 w-full items-center justify-between rounded border bg-foreground px-3 py-2 text-sm font-normal text-basic focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-accent",
            !date ? "text-muted-foreground" : "",
            className,
          )}
        >
          {date ? (
            datefns.format(date, "PPP")
          ) : (
            <span>{t("datePicker.placeholder")}</span>
          )}
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
