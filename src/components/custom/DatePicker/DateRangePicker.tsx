"use client";

import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { ForwardedRef } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import type { ValueLabel } from "@/shared/types/options";
import { cn } from "@/shared/utils";

import type { DatePickerProps, Period } from "./types";

const DEFAULT_OPTIONS: Period[] = [
  "today",
  "this_week",
  "this_month",
  "this_year",
  "last_week",
  "last_2week",
  "last_3week",
  "last_4week",
  "last_month",
  "last_2month",
  "last_3month",
  "last_4month",
  "last_5month",
  "last_6month",
  "last_7month",
  "last_8month",
  "last_9month",
  "last_10month",
  "last_11month",
  "last_year",
  "last_2year",
  "range",
];

const RANGE_LABEL_KEYS: Record<Period, string> = {
  today: "today",
  this_week: "thisWeek",
  this_month: "thisMonth",
  this_year: "thisYear",
  last_week: "lastWeek",
  last_2week: "last2Week",
  last_3week: "last3Week",
  last_4week: "last4Week",
  last_month: "lastMonth",
  last_2month: "last2Month",
  last_3month: "last3Month",
  last_4month: "last4Month",
  last_5month: "last5Month",
  last_6month: "last6Month",
  last_7month: "last7Month",
  last_8month: "last8Month",
  last_9month: "last9Month",
  last_10month: "last10Month",
  last_11month: "last11Month",
  last_year: "lastYear",
  last_2year: "last2Year",
  range: "dateRange",
};

const DATE_FORMAT = "dd MMM yyyy";

const formatRangeText = (from?: Date, to?: Date) => {
  const formattedStartDate = from ? format(from, DATE_FORMAT) : "";
  const formattedEndDate = to ? format(to, DATE_FORMAT) : "";

  return `${formattedStartDate} - ${formattedEndDate}`.trim();
};

const getRelativeStartDate = (period: Period) => {
  const today = new Date();
  const match = /^last_(\d+)?(week|month|year)$/.exec(period);

  if (!match) {
    return today;
  }

  const [, amountValue, unit] = match;
  const amount = amountValue ? Number.parseInt(amountValue, 10) : 1;

  if (Number.isNaN(amount)) {
    return today;
  }

  switch (unit) {
    case "week":
      return addWeeks(today, -amount);
    case "month":
      return addMonths(today, -amount);
    case "year":
      return addYears(today, -amount);
    default:
      return today;
  }
};

const Component = (
  {
    className,
    variant,
    period,
    setPeriod,
    range,
    setRange,
    showRange = false,
    setRangeText,
    options = DEFAULT_OPTIONS,
  }: DatePickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const { t } = useTranslation("DatePicker");

  const [open, setOpen] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const openTimeoutRef = useRef<number | null>(null);

  const optionData = useMemo<ValueLabel[]>(
    () =>
      options.map((item) => ({
        value: item,
        label: t(RANGE_LABEL_KEYS[item]),
      })),
    [options, t],
  );

  const triggerValue = useMemo(() => {
    return showRange && displayText ? displayText : t("dateRange");
  }, [displayText, showRange, t]);

  const updateDisplayText = useCallback(
    (text: string) => {
      setDisplayText(text);
      setRangeText?.(text);
    },
    [setRangeText],
  );

  const clearScheduledOpen = useCallback(() => {
    if (openTimeoutRef.current !== null) {
      window.clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearScheduledOpen();
    openTimeoutRef.current = window.setTimeout(() => {
      setOpen(true);
      openTimeoutRef.current = null;
    }, 0);
  }, [clearScheduledOpen]);

  const calculateAndSetDisplayText = useCallback(
    (value: Period) => {
      const today = new Date();

      switch (value) {
        case "today": {
          clearScheduledOpen();
          setRange({ from: today, to: today });
          updateDisplayText(format(today, DATE_FORMAT));
          setOpen(false);
          return;
        }

        case "this_week": {
          clearScheduledOpen();
          const startWeek = startOfWeek(today, { weekStartsOn: 1 });
          const endWeek = endOfWeek(today, { weekStartsOn: 1 });

          setRange({ from: startWeek, to: endWeek });
          updateDisplayText(formatRangeText(startWeek, endWeek));
          setOpen(false);
          return;
        }

        case "this_month": {
          clearScheduledOpen();
          const startMonth = startOfMonth(today);
          const endMonth = endOfMonth(today);

          setRange({ from: startMonth, to: endMonth });
          updateDisplayText(formatRangeText(startMonth, endMonth));
          setOpen(false);
          return;
        }

        case "this_year": {
          clearScheduledOpen();
          const startYear = startOfYear(today);
          const endYear = endOfYear(today);

          setRange({ from: startYear, to: endYear });
          updateDisplayText(formatRangeText(startYear, endYear));
          setOpen(false);
          return;
        }

        case "range":
          setRange(undefined);
          updateDisplayText("");
          scheduleOpen();
          return;

        default: {
          clearScheduledOpen();
          const startDate = getRelativeStartDate(value);

          setRange({ from: startDate, to: today });
          updateDisplayText(formatRangeText(startDate, today));
          setOpen(false);
        }
      }
    },
    [clearScheduledOpen, scheduleOpen, setRange, updateDisplayText],
  );

  const onDateSelect: OnSelectHandler<DateRange | undefined> = (
    selectedRange,
  ) => {
    if (!selectedRange) {
      setRange(undefined);
      updateDisplayText("");
      return;
    }

    const { from, to } = selectedRange;
    const text = formatRangeText(from, to);

    updateDisplayText(text);
    setRange({ from, to });

    if (from && to && !isSameDay(from, to)) {
      setOpen(false);
    }
  };

  const handleRangeReselect = useCallback(() => {
    if (period === "range") {
      calculateAndSetDisplayText("range");
    }
  }, [calculateAndSetDisplayText, period]);

  useEffect(() => {
    return () => {
      clearScheduledOpen();
    };
  }, [clearScheduledOpen]);

  useEffect(() => {
    if (period && !range) {
      calculateAndSetDisplayText(period);
    }
  }, [calculateAndSetDisplayText, period, range]);

  useEffect(() => {
    if (!range?.from) {
      if (period !== "range") {
        updateDisplayText("");
      }
      return;
    }

    updateDisplayText(formatRangeText(range.from, range.to));
  }, [period, range, updateDisplayText]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={ref} className="relative">
          <Select
            value={period}
            onValueChange={(value: Period) => {
              setPeriod(value);
              calculateAndSetDisplayText(value);
            }}
          >
            <SelectTrigger
              variant={variant}
              className={cn("border-slate-150 h-10", className)}
              title={t("rangePlaceholder")}
            >
              {period === "range" ? (
                triggerValue
              ) : (
                <SelectValue placeholder={t("rangePlaceholder")} />
              )}
            </SelectTrigger>
            <SelectContent>
              {optionData.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
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
          onSelect={onDateSelect}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
};

export const DateRangePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  Component,
);

DateRangePicker.displayName = "DateRangePicker";
