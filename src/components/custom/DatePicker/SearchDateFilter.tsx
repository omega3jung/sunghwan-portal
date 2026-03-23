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
import { cn } from "@/shared/utils";

import type { SearchDateFilterProps } from "./types";
import { formatRangeText } from "./utils";

const Component = <T extends string>(
  {
    className,
    variant,
    value,
    onValueChange,
    range,
    onRangeChange,
    options,
    resolveRange,
    showRangeText = false,
    rangeValue = "range" as T,
  }: SearchDateFilterProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const { t } = useTranslation("DatePicker");
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((item) => item.value === value),
    [options, value],
  );

  const isRangeSelected = value === rangeValue;

  const triggerText = useMemo(() => {
    if (!isRangeSelected) {
      return selectedOption?.label ?? t("rangePlaceholder");
    }

    if (!showRangeText) {
      return selectedOption?.label ?? t("dateRange");
    }

    return formatRangeText(range) || selectedOption?.label || t("dateRange");
  }, [isRangeSelected, range, selectedOption?.label, showRangeText, t]);

  const applyValue = useCallback(
    (nextValue: T) => {
      onValueChange(nextValue);

      if (nextValue === rangeValue) {
        setOpen(true);
        return;
      }

      onRangeChange(resolveRange?.(nextValue));
      setOpen(false);
    },
    [onRangeChange, onValueChange, rangeValue, resolveRange],
  );

  const handleDateSelect: OnSelectHandler<DateRange | undefined> = useCallback(
    (selectedRange) => {
      onRangeChange(selectedRange);
      onValueChange(rangeValue);

      if (selectedRange?.from && selectedRange?.to) {
        setOpen(false);
      }
    },
    [onRangeChange, onValueChange, rangeValue],
  );

  const handleRangeReselect = useCallback(() => {
    if (isRangeSelected) {
      setOpen(true);
    }
  }, [isRangeSelected]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div ref={ref} className="relative">
          <Select
            value={value}
            onValueChange={(nextValue) => {
              applyValue(nextValue as T);
            }}
          >
            <SelectTrigger
              variant={variant}
              className={cn("border-slate-150 h-10", className)}
              title={triggerText}
            >
              {isRangeSelected ? (
                <span className="truncate">{triggerText}</span>
              ) : (
                <SelectValue placeholder={t("rangePlaceholder")} />
              )}
            </SelectTrigger>

            <SelectContent>
              {options.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  onPointerUp={() => {
                    if (item.value === rangeValue) {
                      handleRangeReselect();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      item.value === rangeValue &&
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

const SearchDateFilterComponent = forwardRef(Component);

SearchDateFilterComponent.displayName = "SearchDateFilter";

export const SearchDateFilter = SearchDateFilterComponent as <
  T extends string = string,
>(
  props: SearchDateFilterProps<T> & {
    ref?: ForwardedRef<HTMLDivElement>;
  },
) => ReturnType<typeof Component>;
