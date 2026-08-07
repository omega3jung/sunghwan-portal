"use client";

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
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import type { SearchDateFilterProps } from "./types";
import {
  formatDateText,
  formatRangeText,
  isSameDateRange,
  normalizeDateRange,
} from "./utils";

function hasRangeValue(range?: DateRange) {
  return Boolean(range?.from || range?.to);
}

/**
 * Combines domain-specific filter values with optional free-form date selection.
 * `rangeValue` selects calendar mode; every other value resolves through
 * `resolveRange`. The parent always owns the concrete range.
 */
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
    showTextType = "text",
    rangeValue = "range" as T,
    modal = true,
  }: SearchDateFilterProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const { t } = useTranslation(NS.component, {
    keyPrefix: "datePicker",
  });
  const [open, setOpen] = useState(false);

  const preventSelectFocusRestoreRef = useRef(false);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);
  // Cache one resolution per value so relative presets do not drift during synchronization.
  const resolvedValueRangeRef = useRef<DateRange | undefined>(undefined);
  // Tracks the value already published to the parent to avoid redundant synchronization.
  const lastSyncedValueRef = useRef<T | undefined>(undefined);

  // Base UI Select requires a concrete value even while the external filter is empty.
  const safeValue = value ?? options[0]?.value ?? "";
  const normalizedRange = useMemo(() => normalizeDateRange(range), [range]);

  // Wait for Select cleanup before opening the calendar, or focus restoration closes it again.
  const openCalendar = useCallback(() => {
    requestAnimationFrame(() => {
      setOpen(true);

      setTimeout(() => {
        preventSelectFocusRestoreRef.current = false;
      }, 0);
    });
  }, []);

  const selectedOption = useMemo(
    () => options.find((item) => item.value === value),
    [options, value],
  );

  const labelText = useMemo(() => {
    return selectedOption?.label ?? t("rangePlaceholder");
  }, [selectedOption?.label, t]);

  // Prefer parent state; resolve a display-only fallback while preset synchronization is pending.
  const rangeForTrigger = useMemo(() => {
    if (hasRangeValue(normalizedRange)) {
      return normalizedRange;
    }

    if (!value || value === rangeValue) {
      return normalizedRange;
    }

    return (
      resolvedValueRangeRef.current ?? normalizeDateRange(resolveRange?.(value))
    );
  }, [normalizedRange, rangeValue, resolveRange, value]);

  // "today" is a presentation exception; the stored value remains a range.
  const rangeText = useMemo(() => {
    if (!rangeForTrigger?.from) {
      return "";
    }

    if (value === "today") {
      return formatDateText(rangeForTrigger.from);
    }

    return formatRangeText(rangeForTrigger);
  }, [rangeForTrigger, value]);

  const triggerText = useMemo(() => {
    switch (showTextType) {
      case "range":
        return rangeText || labelText;
      case "all":
        return rangeText ? `${labelText} (${rangeText})` : labelText;
      case "text":
      default:
        return labelText;
    }
  }, [labelText, rangeText, showTextType]);

  // Presets publish their range immediately; calendar mode clears the prior preset range first.
  const applyValue = useCallback(
    (nextValue: T) => {
      onValueChange(nextValue);

      if (nextValue === rangeValue) {
        lastSyncedValueRef.current = nextValue;
        resolvedValueRangeRef.current = undefined;

        if (value !== rangeValue) {
          onRangeChange(undefined);
        }

        preventSelectFocusRestoreRef.current = true;
        openCalendar();
        return;
      }

      preventSelectFocusRestoreRef.current = false;
      const nextRange = normalizeDateRange(resolveRange?.(nextValue));

      lastSyncedValueRef.current = nextValue;
      resolvedValueRangeRef.current = nextRange;
      onRangeChange(nextRange);
      setOpen(false);
    },
    [
      onRangeChange,
      onValueChange,
      openCalendar,
      rangeValue,
      resolveRange,
      value,
    ],
  );

  /**
   * Publish calendar mode before its range. Reversing the order lets preset-mode
   * synchronization overwrite the user's newly selected dates.
   */
  const handleDateSelect: OnSelectHandler<DateRange | undefined> = useCallback(
    (selectedRange) => {
      lastSyncedValueRef.current = rangeValue;
      resolvedValueRangeRef.current = selectedRange;
      onValueChange(rangeValue);
      onRangeChange(selectedRange);

      if (selectedRange?.from && selectedRange?.to) {
        setOpen(false);
      }
    },
    [onRangeChange, onValueChange, rangeValue],
  );

  // Select emits no change for the active value, so calendar reselection is bridged explicitly.
  const handleRangeReselect = useCallback(() => {
    if (value === rangeValue) {
      preventSelectFocusRestoreRef.current = true;
      openCalendar();
    }
  }, [openCalendar, rangeValue, value]);

  /**
   * Repair parent state after restoration or external filter changes. The
   * resolved range is cached so relative presets stay stable during a sync.
   */
  const syncRangeFromValue = useCallback(() => {
    if (!value || value === rangeValue || !resolveRange) {
      lastSyncedValueRef.current = value;
      resolvedValueRangeRef.current = undefined;
      return;
    }

    const valueChanged = lastSyncedValueRef.current !== value;

    if (valueChanged || resolvedValueRangeRef.current === undefined) {
      resolvedValueRangeRef.current = normalizeDateRange(resolveRange(value));
    }

    const nextRange = resolvedValueRangeRef.current;
    const rangeMissing = !hasRangeValue(normalizedRange);
    const rangeChanged = !isSameDateRange(normalizedRange, nextRange);
    const shouldSyncRange = valueChanged || rangeMissing || rangeChanged;

    if (shouldSyncRange && rangeChanged) {
      onRangeChange(nextRange);
    }

    lastSyncedValueRef.current = value;
  }, [normalizedRange, onRangeChange, rangeValue, resolveRange, value]);

  useEffect(() => {
    // Direct user actions publish immediately; this path repairs mount and external restoration.
    syncRangeFromValue();
  }, [syncRangeFromValue]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <div ref={ref} className="relative">
        <Select
          value={safeValue}
          onValueChange={(nextValue) => {
            if (nextValue !== null) {
              applyValue(nextValue as T);
            }
          }}
        >
          <SelectTrigger
            ref={selectTriggerRef}
            variant={variant}
            className={cn("border-slate-150 h-10", className)}
            title={triggerText}
          >
            <span className="truncate">{triggerText}</span>
          </SelectTrigger>

          <SelectContent
            // Suppress Select focus restoration while focus is handed to the calendar.
            finalFocus={() => !preventSelectFocusRestoreRef.current}
          >
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

      <PopoverContent
        anchor={selectTriggerRef}
        className="z-51 w-auto p-0"
        align="start"
      >
        <Calendar
          mode="range"
          resetOnSelect
          selected={normalizedRange}
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
