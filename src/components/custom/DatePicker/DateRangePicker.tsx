"use client";

import type { ForwardedRef } from "react";
import { forwardRef, useCallback, useMemo, useState } from "react";
import type { DateRange, OnSelectHandler } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_RANGE_PRESET_LABEL_KEYS,
  DEFAULT_DATE_RANGE_PRESETS,
} from "@/shared/constants/date";
import { DateRangePreset } from "@/shared/types";
import { cn } from "@/shared/utils";

import type { DateRangePickerProps } from "./types";
import { formatRangeText, resolvePresetRange } from "./utils";

const Component = (
  {
    className,
    variant,
    period,
    onPeriodChange,
    range,
    onRangeChange,
    showRangeText = false,
    options = DEFAULT_DATE_RANGE_PRESETS,
  }: DateRangePickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const { t } = useTranslation("DatePicker");
  const [open, setOpen] = useState(false);

  const optionData = useMemo(
    () =>
      options.map((value) => ({
        value,
        label: t(DATE_RANGE_PRESET_LABEL_KEYS[value]),
      })),
    [options, t],
  );

  const displayText = useMemo(() => {
    if (period !== "range") {
      return "";
    }

    return formatRangeText(range);
  }, [period, range]);

  const triggerText = useMemo(() => {
    if (!showRangeText || period !== "range" || !displayText) {
      return t("dateRange");
    }

    return displayText;
  }, [displayText, period, showRangeText, t]);

  const applyPreset = useCallback(
    (nextPeriod: DateRangePreset) => {
      onPeriodChange(nextPeriod);

      if (nextPeriod === "range") {
        setOpen(true);
        return;
      }

      const nextRange = resolvePresetRange(nextPeriod);
      onRangeChange(nextRange);
      setOpen(false);
    },
    [onPeriodChange, onRangeChange],
  );

  const handleDateSelect: OnSelectHandler<DateRange | undefined> = useCallback(
    (selectedRange) => {
      onRangeChange(selectedRange);

      if (selectedRange?.from && selectedRange?.to) {
        setOpen(false);
      }
    },
    [onRangeChange],
  );

  const handleRangeReselect = useCallback(() => {
    if (period === "range") {
      setOpen(true);
    }
  }, [period]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={ref} className="relative">
          <Select
            value={period}
            onValueChange={(value: DateRangePreset) => {
              applyPreset(value);
            }}
          >
            <SelectTrigger
              variant={variant}
              className={cn("border-slate-150 h-10", className)}
              title={t("rangePlaceholder")}
            >
              {period === "range" ? (
                <span className="truncate">{triggerText}</span>
              ) : (
                <SelectValue placeholder={t("rangePlaceholder")} />
              )}
            </SelectTrigger>

            <SelectContent>
              {optionData.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  // Re-open the calendar when the already-selected "range" item is selected again.
                  // Select does not fire onValueChange when the value does not change.
                  onPointerUp={() => {
                    if (item.value === "range") {
                      handleRangeReselect();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      item.value === "range" &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      handleRangeReselect();
                    }
                  }}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverAnchor>

      <PopoverContent className="z-[51] w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
};

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  Component,
);

DateRangePicker.displayName = "DateRangePicker";
