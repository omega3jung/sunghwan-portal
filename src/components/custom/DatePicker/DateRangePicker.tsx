"use client";

import { endOfDay, startOfDay } from "date-fns";
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
import {
  DATE_RANGE_PRESET_LABEL_KEYS,
  DEFAULT_DATE_RANGE_PRESETS,
} from "@/shared/constants/date";
import { DateRangePreset } from "@/shared/types";
import { cn } from "@/shared/utils/presentation";

import type { DateRangePickerProps } from "./types";
import {
  formatDateText,
  formatRangeText,
  isSameDateRange,
  resolvePresetRange,
} from "./utils";

// A partial range is already user state and must not be replaced by a preset.
function hasRangeValue(range?: DateRange) {
  return Boolean(range?.from || range?.to);
}

function normalizeDayBoundaries(range?: DateRange): DateRange | undefined {
  if (!range) {
    return undefined;
  }

  return {
    from: range.from ? startOfDay(range.from) : undefined,
    to: range.to ? endOfDay(range.to) : undefined,
  };
}

/**
 * Supports controlled or uncontrolled preset selection without mixing modes.
 * The concrete range always remains parent-owned, including custom calendar
 * selection and ranges derived from relative presets.
 */
const Component = (
  props: DateRangePickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const {
    className,
    variant,
    period: controlledPeriod,
    onPeriodChange,
    defaultPeriod,
    range,
    onRangeChange,
    showTextType = "text",
    modal = true,
    options = DEFAULT_DATE_RANGE_PRESETS,
  } = props;
  const { t } = useTranslation(NS.component, {
    keyPrefix: "datePicker",
  });

  const [open, setOpen] = useState(false);

  const [internalPeriod, setInternalPeriod] = useState<
    DateRangePreset | undefined
  >(() => defaultPeriod ?? (hasRangeValue(range) ? "range" : undefined));

  const preventSelectFocusRestoreRef = useRef(false);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);

  // Relative presets use one anchor so rerenders cannot move the effective range.
  const presetSyncAnchorRef = useRef<Date | null>(null);

  // Tracks the preset already published to the parent to avoid redundant synchronization.
  const lastSyncedPresetRef = useRef<DateRangePreset | undefined>(undefined);

  const isControlledPeriod =
    controlledPeriod !== undefined && onPeriodChange !== undefined;

  const period = isControlledPeriod ? controlledPeriod : internalPeriod;

  // Base UI Select requires a concrete value even before a preset is chosen.
  const safePeriod = period ?? "today";

  const updatePeriod = useCallback(
    (nextPeriod?: DateRangePreset) => {
      if (onPeriodChange) {
        onPeriodChange(nextPeriod);
        return;
      }

      setInternalPeriod(nextPeriod);
    },
    [onPeriodChange],
  );

  // If an uncontrolled consumer later provides a concrete range from outside,
  // align the internal period to "range" so trigger and selection state stay coherent.
  useEffect(() => {
    if (!isControlledPeriod && !internalPeriod && hasRangeValue(range)) {
      setInternalPeriod("range");
    }
  }, [internalPeriod, isControlledPeriod, range]);

  // Wait for Select cleanup before opening the calendar, or focus restoration closes it again.
  const openCalendar = useCallback(() => {
    requestAnimationFrame(() => {
      setOpen(true);

      setTimeout(() => {
        preventSelectFocusRestoreRef.current = false;
      }, 0);
    });
  }, []);

  const optionData = useMemo(
    () =>
      options.map((value) => ({
        value,
        label: t(DATE_RANGE_PRESET_LABEL_KEYS[value]),
      })),
    [options, t],
  );

  const selectedOption = useMemo(
    () => optionData.find((item) => item.value === period),
    [optionData, period],
  );

  const labelText = useMemo(() => {
    return selectedOption?.label ?? t("rangePlaceholder");
  }, [selectedOption?.label, t]);

  // A derived fallback keeps the trigger stable while the parent range is being synchronized.
  const rangeForTrigger = useMemo(() => {
    if (hasRangeValue(range)) {
      return range;
    }

    if (!period || period === "range") {
      return range;
    }

    return resolvePresetRange(
      period,
      presetSyncAnchorRef.current ?? new Date(),
    );
  }, [period, range]);

  // "today" is a presentation exception; the stored value remains a range.
  const rangeText = useMemo(() => {
    if (!rangeForTrigger?.from) {
      return "";
    }

    if (period === "today") {
      return formatDateText(rangeForTrigger.from);
    }

    return formatRangeText(rangeForTrigger);
  }, [period, rangeForTrigger]);

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

  // Presets publish their concrete range immediately; the parent remains the source of truth.
  const applyPreset = useCallback(
    (nextPeriod: DateRangePreset) => {
      updatePeriod(nextPeriod);

      if (nextPeriod === "range") {
        if (period !== "range") {
          onRangeChange(undefined);
        }

        preventSelectFocusRestoreRef.current = true;
        openCalendar();
        return;
      }

      preventSelectFocusRestoreRef.current = false;
      const anchorDate = new Date();
      presetSyncAnchorRef.current = anchorDate;
      const nextRange = normalizeDayBoundaries(
        resolvePresetRange(nextPeriod, anchorDate),
      );
      onRangeChange(nextRange);
      setOpen(false);
    },
    [onRangeChange, openCalendar, period, updatePeriod],
  );

  // Free-form interaction switches the semantic preset before publishing its range.
  const handleDateSelect: OnSelectHandler<DateRange | undefined> = useCallback(
    (selectedRange) => {
      if (period !== "range") {
        updatePeriod("range");
      }

      const normalizedRange = normalizeDayBoundaries(selectedRange);
      onRangeChange(normalizedRange);

      if (normalizedRange?.from && normalizedRange?.to) {
        setOpen(false);
      }
    },
    [onRangeChange, period, updatePeriod],
  );

  // Select emits no change for the active value, so reselecting "range" is bridged explicitly.
  const handleRangeReselect = useCallback(() => {
    if (period === "range") {
      preventSelectFocusRestoreRef.current = true;
      openCalendar();
    }
  }, [openCalendar, period]);

  // Repair restored or externally cleared parent state without continuously recomputing relative presets.
  const syncRangeFromPreset = useCallback(() => {
    if (!period || period === "range") {
      lastSyncedPresetRef.current = period;
      return;
    }

    const presetChanged = lastSyncedPresetRef.current !== period;

    if (presetChanged || !presetSyncAnchorRef.current) {
      presetSyncAnchorRef.current = new Date();
    }

    const shouldSyncRange = presetChanged || !hasRangeValue(range);

    if (!shouldSyncRange) {
      lastSyncedPresetRef.current = period;
      return;
    }

    const nextRange = normalizeDayBoundaries(
      resolvePresetRange(period, presetSyncAnchorRef.current),
    );

    if (!isSameDateRange(range, nextRange)) {
      onRangeChange(nextRange);
    }

    lastSyncedPresetRef.current = period;
  }, [onRangeChange, period, range]);

  useEffect(() => {
    syncRangeFromPreset();
  }, [syncRangeFromPreset]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <div ref={ref} className="relative">
        <Select
          value={safePeriod}
          onValueChange={(value) => {
            if (value !== null) {
              applyPreset(value);
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

      <PopoverContent
        anchor={selectTriggerRef}
        className="z-51 w-auto p-0"
        align="start"
      >
        <Calendar
          mode="range"
          resetOnSelect
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
