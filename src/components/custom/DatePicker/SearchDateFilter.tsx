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
} from "@/components/ui/select";
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
 * SearchDateFilter combines a generic select filter with optional date-range picking.
 *
 * The selected `value` decides whether the component is in preset mode or custom-range mode:
 * - `value === rangeValue`: custom-range mode
 * - `value !== rangeValue`: preset mode
 *
 * The parent always owns the concrete `range`.
 * In preset mode, that parent range is expected to stay in sync with `resolveRange(value)`.
 * In custom-range mode, the parent range comes directly from calendar interaction.
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
  const { t } = useTranslation("DatePicker");
  const [open, setOpen] = useState(false);

  /**
   * Opening the calendar immediately after a Select interaction can cause focus restoration
   * to bounce focus back into the trigger and close the popover again.
   * This ref plus the delayed open sequence below intentionally breaks that cycle.
   */
  const preventSelectFocusRestoreRef = useRef(false);
  const resolvedValueRangeRef = useRef<DateRange | undefined>(undefined);
  const lastSyncedValueRef = useRef<T | undefined>(undefined);

  /**
   * Radix Select expects a concrete value at all times.
   * Passing `undefined` directly can push the component into awkward controlled/uncontrolled edges,
   * so we fall back to the first available option only for Select's internal value handling.
   */
  const safeValue = value ?? options[0]?.value ?? "";
  const normalizedRange = useMemo(() => normalizeDateRange(range), [range]);

  /**
   * The calendar is opened one tick after the Select interaction finishes.
   * That timing avoids Select's own focus cleanup from immediately collapsing the popover we want to show.
   */
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

  /**
   * Trigger text should prefer the actual parent-owned range when it exists.
   * If the parent range has not been synchronized yet, we fall back to a display-only resolved range
   * so the trigger can still reflect the current preset selection without pretending state is already saved.
   *
   * Priority:
   * 1. actual parent range
   * 2. custom-range mode with no fallback resolution
   * 3. preset value resolved through resolveRange(value)
   */
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

  /**
   * Trigger formatting has one UX exception: "today" reads better as a single date than as a one-day range.
   * This exception is only for trigger presentation; the underlying stored range remains a normal date range.
   */
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

  /**
   * This handles direct user intent from the Select.
   *
   * Preset selection:
   * - resolve the preset immediately
   * - push the concrete range to the parent immediately
   * - close the calendar
   *
   * Custom-range selection (`rangeValue`):
   * - clear the previously owned range when switching into free-form mode
   * - open the calendar instead of resolving anything
   * - suppress Select's focus restoration so the popover stays open
   */
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
   * Parent updates must happen in value-first order.
   * If the range is pushed first and the parent still thinks it is in preset mode,
   * the subsequent value update can overwrite that freshly selected range with older state.
   *
   * By switching to `rangeValue` first, the parent is already in custom-range mode
   * when the concrete range arrives, so the selectedRange is preserved.
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

  /**
   * Select does not emit a change when the user picks the already-selected value again.
   * Custom-range mode still needs a way to reopen the calendar in that case,
   * so pointer/key handlers explicitly bridge that UX gap.
   */
  const handleRangeReselect = useCallback(() => {
    if (value === rangeValue) {
      preventSelectFocusRestoreRef.current = true;
      openCalendar();
    }
  }, [openCalendar, rangeValue, value]);

  /**
   * This is not trigger fallback logic; it is parent-state repair logic.
   *
   * Its job is to keep the actual parent-owned range aligned with the current preset value when:
   * - the component mounts with a restored preset value
   * - external state changes the value
   * - the stored range is missing or stale
   *
   * It only applies in preset mode:
   * - value exists
   * - value !== rangeValue
   * - resolveRange exists
   *
   * Synchronization is needed when:
   * - the selected value changed
   * - the parent range is empty/incomplete
   * - the parent range no longer matches resolveRange(value)
   *
   * isSameDateRange prevents redundant parent updates once the effective state is already aligned.
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

  /**
   * User actions are handled immediately in applyValue/handleDateSelect.
   * This effect exists for the other half of the contract: initial mount and external state restoration.
   */
  useEffect(() => {
    syncRangeFromValue();
  }, [syncRangeFromValue]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverAnchor asChild>
        <div ref={ref} className="relative">
          <Select
            value={safeValue}
            onValueChange={(nextValue) => {
              applyValue(nextValue as T);
            }}
          >
            <SelectTrigger
              variant={variant}
              className={cn("border-slate-150 h-10", className)}
              title={triggerText}
            >
              <span className="truncate">{triggerText}</span>
            </SelectTrigger>

            <SelectContent
              /**
               * When Select selection intentionally chains into calendar open,
               * its default focus restoration would collapse the popover again.
               * Preventing that restoration is what lets Select and Calendar behave like one control.
               */
              onCloseAutoFocus={(event) => {
                if (preventSelectFocusRestoreRef.current) {
                  event.preventDefault();
                }
              }}
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
      </PopoverAnchor>

      <PopoverContent className="z-[51] w-auto p-0" align="start">
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
