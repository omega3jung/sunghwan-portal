import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { DateRange, OnSelectHandler } from "react-day-picker";
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
import i18n from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ValueLabel } from "@/types/common";

import { DatePickerProps, Period, Range } from "./types";

const ns = {
  ns: "DateRangePicker",
};

const rangeData: Range = {
  today: i18n.t("today", ns),
  this_week: i18n.t("thisWeek", ns),
  this_month: i18n.t("thisMonth", ns),
  this_year: i18n.t("thisYear", ns),
  last_week: i18n.t("lastWeek", ns),
  last_2week: i18n.t("last2Week", ns),
  last_3week: i18n.t("last3Week", ns),
  last_4week: i18n.t("last4Week", ns),
  last_month: i18n.t("lastMonth", ns),
  last_2month: i18n.t("last2Month", ns),
  last_3month: i18n.t("last3Month", ns),
  last_4month: i18n.t("last4Month", ns),
  last_5month: i18n.t("last5Month", ns),
  last_6month: i18n.t("last6Month", ns),
  last_7month: i18n.t("last7Month", ns),
  last_8month: i18n.t("last8Month", ns),
  last_9month: i18n.t("last9Month", ns),
  last_10month: i18n.t("last10Month", ns),
  last_11month: i18n.t("last11Month", ns),
  last_year: i18n.t("lastYear", ns),
  last_2year: i18n.t("last2Year", ns),
  range: i18n.t("dateRange", ns),
};

export const Component = (
  props: DatePickerProps,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    className,
    variant,
    period,
    setPeriod,
    range,
    setRange,
    showRange = false,
    setRangeText,
    options = [
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
    ],
  } = props;

  const { t } = useTranslation("DateRangePicker");

  const [open, setOpen] = useState<boolean>(false);
  const [displayText, setDisplayText] = useState<string>("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const optionData = useMemo<ValueLabel[]>(
    () =>
      options.map((item) => ({
        value: item,
        label: rangeData[item],
      })) as ValueLabel[],
    [options]
  );

  const trigerValue = useMemo<string>(() => {
    return showRange && !!displayText
      ? displayText
      : t("dateRangePicker.dateRange");
  }, [showRange, displayText, t]);

  const calculateAndSetDisplayText = useCallback(
    (value: Period) => {
      let text;
      const today = new Date();

      switch (value) {
        case "today":
          setRange({ from: today, to: today });
          text = `${format(today, "dd MMM yyyy")}`;
          setOpen(false);
          break;

        case "this_week": {
          const startWeek = startOfWeek(today, { weekStartsOn: 1 });
          const endWeek = endOfWeek(today, { weekStartsOn: 1 });

          setRange({ from: startWeek, to: endWeek });
          text = `${format(startWeek, "dd MMM yyyy")} - ${format(
            endWeek,
            "dd MMM yyyy"
          )}`;
          break;
        }

        case "this_month": {
          const startMonth = startOfMonth(today);
          const endMonth = endOfMonth(today);

          setRange({ from: startMonth, to: endMonth });
          text = `${format(startMonth, "dd MMM yyyy")} - ${format(
            endMonth,
            "dd MMM yyyy"
          )}`;
          break;
        }

        case "this_year": {
          const startMonth = startOfYear(today);
          const endMonth = endOfYear(today);

          setRange({ from: startMonth, to: endMonth });
          text = `${format(startMonth, "dd MMM yyyy")} - ${format(
            endMonth,
            "dd MMM yyyy"
          )}`;
          break;
        }

        case "range":
          setRange(undefined);
          setOpen(true);

          return; // Early return to avoid setting text when opening the calendar.

        // last n weeks, months, years.
        default: {
          const startDate = setLastNPeriod(value);

          setRange({ from: startDate, to: today });
          text = `${format(startDate, "dd MMM yyyy")} - ${format(
            today,
            "dd MMM yyyy"
          )}`;
          break;
        }
      }

      setDisplayText(text);

      if (setRangeText) {
        setRangeText(text);
      }
      setOpen(false);
    },
    [setRange, setRangeText]
  );

  const setLastNPeriod = (period: Period) => {
    try {
      const today = new Date();

      if (period.endsWith("week")) {
        const amountString = period.replace("last_", "").replace("week", "");
        const amount = !amountString.length ? 1 : parseInt(amountString);

        return addWeeks(today, -amount);
      } else if (period.endsWith("month")) {
        const amountString = period.replace("last_", "").replace("month", "");
        const amount = !amountString.length ? 1 : parseInt(amountString);

        return addMonths(today, -amount);
      } else if (period.endsWith("year")) {
        const amountString = period.replace("last_", "").replace("year", "");
        const amount = !amountString.length ? 1 : parseInt(amountString);

        return addYears(today, -amount);
      }

      return today;
    } catch (error) {
      return new Date();
    }
  };

  const onDateSelect: OnSelectHandler<DateRange | undefined> = (range) => {
    if (!range) return;

    const { from, to } = range;

    const formattedStartDate = from ? format(from, "dd MMM yyyy") : "";
    const formattedEndDate = to ? format(to, "dd MMM yyyy") : "";

    const text = `${formattedStartDate} - ${formattedEndDate}`;

    setDisplayText(text);
    setRangeText?.(text);

    setRange({ from, to });

    if (from && to) {
      setOpen(false);
    }
  };

  // trigered to set range when loading.
  useEffect(() => {
    if (!!period && !range) {
      calculateAndSetDisplayText(period);
    }
  }, [calculateAndSetDisplayText, period, range]);

  return (
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
          title={t("dateRangePicker.placeHolder")}
        >
          {period === "range" ? (
            trigerValue
          ) : (
            <SelectValue placeholder={t("dateRangePicker.placeHolder")} />
          )}
        </SelectTrigger>
        <SelectContent>
          {optionData.map((item) => (
            <SelectItem key={item.value} value={`${item.value}`}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover
        open={open}
        onOpenChange={() => {
          if (buttonRef.current) {
            buttonRef.current.click();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            className="absolute left-1/2 top-0 -z-[1]"
            variant="ghost"
          ></Button>
        </PopoverTrigger>
        <PopoverContent className="z-[51] w-auto p-0" align="center">
          <Calendar mode="range" selected={range} onSelect={onDateSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const DateRangePicker = React.forwardRef<
  HTMLDivElement,
  DatePickerProps
>(Component);
