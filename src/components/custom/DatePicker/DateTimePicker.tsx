"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Calendar as CalendarIcon, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/utils/presentation";

import type { DateTimePickerMinuteStep, DateTimePickerProps } from "./types";
import {
  formatDateTimeText,
  isCalendarDateDisabled,
  normalizeDateValue,
} from "./utils";

const SUPPORTED_MINUTE_STEPS: DateTimePickerMinuteStep[] = [1, 5, 10, 15, 30];

function normalizeMinuteStep(step?: number): DateTimePickerMinuteStep {
  if (!step || !Number.isFinite(step)) {
    return 1;
  }

  return SUPPORTED_MINUTE_STEPS.includes(step as DateTimePickerMinuteStep)
    ? (step as DateTimePickerMinuteStep)
    : 1;
}

function padTimeUnit(value: number) {
  return value.toString().padStart(2, "0");
}

function roundDateToMinuteStep(
  date: Date,
  minuteStep: DateTimePickerMinuteStep,
) {
  const roundedDate = new Date(date);
  const roundedMinutes =
    Math.floor(roundedDate.getMinutes() / minuteStep) * minuteStep;

  roundedDate.setMinutes(roundedMinutes, 0, 0);

  return roundedDate;
}

function clampDateTime(date: Date, minDate?: Date, maxDate?: Date) {
  if (minDate && date < minDate) {
    return new Date(minDate);
  }

  if (maxDate && date > maxDate) {
    return new Date(maxDate);
  }

  return date;
}

function isDateTimeSelectable(date: Date, minDate?: Date, maxDate?: Date) {
  if (minDate && date < minDate) {
    return false;
  }

  if (maxDate && date > maxDate) {
    return false;
  }

  return true;
}

function createMinuteOptions(
  selectedMinute: number | undefined,
  minuteStep: DateTimePickerMinuteStep,
) {
  const optionSet = new Set<number>();

  for (let minute = 0; minute < 60; minute += minuteStep) {
    optionSet.add(minute);
  }

  if (selectedMinute !== undefined) {
    optionSet.add(selectedMinute);
  }

  return [...optionSet].sort((left, right) => left - right);
}

function withTimeParts(baseDate: Date, hour: number, minute: number) {
  const nextDate = new Date(baseDate);
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate;
}

function getDefaultDateTime(
  value: Date | undefined,
  defaultValue: Date | undefined,
  minuteStep: DateTimePickerMinuteStep,
  minDate?: Date,
  maxDate?: Date,
) {
  const baseDate =
    normalizeDateValue(value) ?? normalizeDateValue(defaultValue) ?? new Date();
  return clampDateTime(
    roundDateToMinuteStep(baseDate, minuteStep),
    minDate,
    maxDate,
  );
}

export function DateTimePicker({
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  className,
  compact = false,
  minuteStep = 1,
  placeholder,
  variant = "outline",
  size,
  modal = true,
  ...buttonProps
}: DateTimePickerProps) {
  const { t } = useTranslation("DatePicker");

  const [open, setOpen] = useState(false);
  const [dateTime, setDateTime] = useControllableState<Date | undefined>({
    prop: value,
    defaultProp: defaultValue,
    onChange,
  });
  const normalizedDateTime = normalizeDateValue(dateTime);
  const normalizedDefaultValue = normalizeDateValue(defaultValue);
  const normalizedMinDate = normalizeDateValue(minDate);
  const normalizedMaxDate = normalizeDateValue(maxDate);

  const resolvedMinuteStep = useMemo(
    () => normalizeMinuteStep(minuteStep),
    [minuteStep],
  );
  const resolvedSize = size ?? (compact ? "sm" : "lg");
  const selectedHour =
    normalizedDateTime !== undefined
      ? padTimeUnit(normalizedDateTime.getHours())
      : undefined;
  const selectedMinuteValue =
    normalizedDateTime !== undefined
      ? normalizedDateTime.getMinutes()
      : undefined;
  const selectedMinute =
    selectedMinuteValue !== undefined
      ? padTimeUnit(selectedMinuteValue)
      : undefined;
  const calendarMonth =
    normalizedDateTime ??
    normalizedDefaultValue ??
    normalizedMinDate ??
    normalizedMaxDate ??
    new Date();
  const minuteOptions = useMemo(
    () => createMinuteOptions(selectedMinuteValue, resolvedMinuteStep),
    [resolvedMinuteStep, selectedMinuteValue],
  );
  const nowValue = useMemo(
    () => roundDateToMinuteStep(new Date(), resolvedMinuteStep),
    [resolvedMinuteStep],
  );
  const canSelectNow = isDateTimeSelectable(
    nowValue,
    normalizedMinDate,
    normalizedMaxDate,
  );

  const updateDateTime = (nextDate: Date | undefined) => {
    setDateTime(nextDate);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      updateDateTime(undefined);
      return;
    }

    const baseDate = getDefaultDateTime(
      normalizedDateTime,
      normalizedDefaultValue,
      resolvedMinuteStep,
      normalizedMinDate,
      normalizedMaxDate,
    );
    const nextDate = withTimeParts(
      selectedDate,
      baseDate.getHours(),
      baseDate.getMinutes(),
    );

    updateDateTime(
      clampDateTime(nextDate, normalizedMinDate, normalizedMaxDate),
    );
  };

  const handleHourChange = (nextHourValue: string) => {
    if (!normalizedDateTime) {
      return;
    }

    const nextDate = withTimeParts(
      normalizedDateTime,
      Number.parseInt(nextHourValue, 10),
      normalizedDateTime.getMinutes(),
    );

    if (isDateTimeSelectable(nextDate, normalizedMinDate, normalizedMaxDate)) {
      updateDateTime(nextDate);
    }
  };

  const handleMinuteChange = (nextMinuteValue: string) => {
    if (!normalizedDateTime) {
      return;
    }

    const nextDate = withTimeParts(
      normalizedDateTime,
      normalizedDateTime.getHours(),
      Number.parseInt(nextMinuteValue, 10),
    );

    if (isDateTimeSelectable(nextDate, normalizedMinDate, normalizedMaxDate)) {
      updateDateTime(nextDate);
    }
  };

  const handleNowClick = () => {
    updateDateTime(nowValue);
    setOpen(false);
  };

  const isHourDisabled = (hour: number) => {
    if (!normalizedDateTime) {
      return true;
    }

    const hourStart = withTimeParts(normalizedDateTime, hour, 0);
    const hourEnd = withTimeParts(normalizedDateTime, hour, 59);

    return !(
      isDateTimeSelectable(hourStart, normalizedMinDate, normalizedMaxDate) ||
      isDateTimeSelectable(hourEnd, normalizedMinDate, normalizedMaxDate)
    );
  };

  const isMinuteDisabled = (minute: number) => {
    if (!normalizedDateTime) {
      return true;
    }

    const nextDate = withTimeParts(
      normalizedDateTime,
      normalizedDateTime.getHours(),
      minute,
    );
    return !isDateTimeSelectable(
      nextDate,
      normalizedMinDate,
      normalizedMaxDate,
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          {...buttonProps}
          variant={variant}
          size={resolvedSize}
          className={cn(
            "w-full justify-between border-slate-150 bg-transparent px-3 font-normal hover:bg-transparent hover:text-basic [&>span]:truncate",
            !normalizedDateTime && "text-muted-foreground",
            className,
          )}
        >
          {normalizedDateTime ? (
            <span>{formatDateTimeText(normalizedDateTime)}</span>
          ) : (
            <span>{placeholder ?? t("dateTimePlaceholder")}</span>
          )}
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn("w-auto p-0", compact && "overflow-hidden")}
        align="start"
      >
        <Calendar
          mode="single"
          selected={normalizedDateTime}
          defaultMonth={calendarMonth}
          onSelect={handleDateSelect}
          disabled={(calendarDate) =>
            isCalendarDateDisabled(
              calendarDate,
              normalizedMinDate,
              normalizedMaxDate,
            )
          }
          className={cn(compact && "p-2 [--cell-size:1.75rem]")}
        />

        <div
          className={cn(
            "border-t px-3 py-3",
            compact ? "space-y-2 px-2 py-2" : "space-y-3",
          )}
        >
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{t("time")}</span>
            </div>

            <Select
              value={selectedHour}
              onValueChange={handleHourChange}
              disabled={!normalizedDateTime}
            >
              <SelectTrigger className={cn(compact && "h-8 px-2 text-xs")}>
                <SelectValue placeholder={t("hour")} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, hour) => (
                  <SelectItem
                    key={hour}
                    value={padTimeUnit(hour)}
                    disabled={isHourDisabled(hour)}
                  >
                    {padTimeUnit(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMinute}
              onValueChange={handleMinuteChange}
              disabled={!normalizedDateTime}
            >
              <SelectTrigger className={cn(compact && "h-8 px-2 text-xs")}>
                <SelectValue placeholder={t("minute")} />
              </SelectTrigger>
              <SelectContent>
                {minuteOptions.map((minute) => (
                  <SelectItem
                    key={minute}
                    value={padTimeUnit(minute)}
                    disabled={isMinuteDisabled(minute)}
                  >
                    {padTimeUnit(minute)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNowClick}
              disabled={!canSelectNow}
            >
              {t("now")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setOpen(false);
              }}
            >
              {t("apply")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
