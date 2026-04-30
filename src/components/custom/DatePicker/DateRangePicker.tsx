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

// A range is treated as "present" as soon as either boundary exists.
// The component uses this same rule for uncontrolled initialization and later sync.
function hasRangeValue(range?: DateRange) {
  return Boolean(range?.from || range?.to);
}

// DateRangePicker supports:
// 1. controlled period mode via period/onPeriodChange
// 2. uncontrolled period mode via defaultPeriod/internalPeriod
// In both cases, the parent still owns the actual date range value.
const Component = (
  props: DateRangePickerProps,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  // Pull out the public API first so the rest of the component can focus on behavior.
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
  const { t } = useTranslation("DatePicker");

  // Popover open state for the calendar layer.
  const [open, setOpen] = useState(false);

  // Uncontrolled period state.
  // If a caller passes only range in uncontrolled mode, treat it as a custom range.
  const [internalPeriod, setInternalPeriod] = useState<
    DateRangePreset | undefined
  >(() => defaultPeriod ?? (hasRangeValue(range) ? "range" : undefined));

  // Prevent Radix Select from restoring focus when we intentionally reopen the calendar.
  const preventSelectFocusRestoreRef = useRef(false);

  // Relative presets such as "last_month" must be resolved from a stable anchor time.
  const presetSyncAnchorRef = useRef<Date | null>(null);

  // Tracks which preset has already been synced into the parent range.
  const lastSyncedPresetRef = useRef<DateRangePreset | undefined>(undefined);

  // Period is controlled only when both controlled props are present.
  const isControlledPeriod =
    controlledPeriod !== undefined && onPeriodChange !== undefined;

  // Normalize period access so the rest of the component does not care about mode.
  const period = isControlledPeriod ? controlledPeriod : internalPeriod;

  // Select expects a value, so fall back to a harmless preset for the uncontrolled empty state.
  const safePeriod = period ?? "today";

  // Update period in the correct ownership mode.
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

  // Open the calendar after Select finishes closing to avoid focus flicker.
  const openCalendar = useCallback(() => {
    requestAnimationFrame(() => {
      setOpen(true);

      setTimeout(() => {
        preventSelectFocusRestoreRef.current = false;
      }, 0);
    });
  }, []);

  // Translate preset keys once for rendering the select options and trigger label.
  const optionData = useMemo(
    () =>
      options.map((value) => ({
        value,
        label: t(DATE_RANGE_PRESET_LABEL_KEYS[value]),
      })),
    [options, t],
  );

  // Resolve the currently selected preset metadata for trigger rendering.
  const selectedOption = useMemo(
    () => optionData.find((item) => item.value === period),
    [optionData, period],
  );

  // Human-readable label part of the trigger text.
  const labelText = useMemo(() => {
    return selectedOption?.label ?? t("rangePlaceholder");
  }, [selectedOption?.label, t]);

  // Trigger text should prefer the concrete parent range when available.
  // If the parent range is temporarily empty while a preset is selected,
  // derive a display-only fallback from the same preset logic.
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

  // Build the range portion of the trigger.
  // "today" is displayed as a single date, while other presets/custom ranges use a full range format.
  const rangeText = useMemo(() => {
    if (!rangeForTrigger?.from) {
      return "";
    }

    if (period === "today") {
      return formatDateText(rangeForTrigger.from);
    }

    return formatRangeText(rangeForTrigger);
  }, [period, rangeForTrigger]);

  // Final trigger text policy:
  // text  -> label only
  // range -> range only
  // all   -> label + range
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

  // Handle preset changes from the Select.
  // Preset selection updates the parent range immediately so the parent remains the source of truth.
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

      // Resolve relative presets from a stable "selection time" anchor.
      preventSelectFocusRestoreRef.current = false;
      const anchorDate = new Date();
      presetSyncAnchorRef.current = anchorDate;
      const nextRange = resolvePresetRange(nextPeriod, anchorDate);
      onRangeChange(nextRange);
      setOpen(false);
    },
    [onRangeChange, openCalendar, period, updatePeriod],
  );

  // Handle user selection inside the calendar.
  // Once the user interacts with free-form dates, the active period becomes "range".
  const handleDateSelect: OnSelectHandler<DateRange | undefined> = useCallback(
    (selectedRange) => {
      if (period !== "range") {
        updatePeriod("range");
      }

      onRangeChange(selectedRange);

      if (selectedRange?.from && selectedRange?.to) {
        setOpen(false);
      }
    },
    [onRangeChange, period, updatePeriod],
  );

  // Selecting the already-active "range" option should reopen the calendar.
  const handleRangeReselect = useCallback(() => {
    if (period === "range") {
      preventSelectFocusRestoreRef.current = true;
      openCalendar();
    }
  }, [openCalendar, period]);

  // Keep parent range and selected preset aligned outside of direct user clicks.
  // This covers initial mount and cases where external state clears or replaces the range.
  const syncRangeFromPreset = useCallback(() => {
    if (!period || period === "range") {
      lastSyncedPresetRef.current = period;
      return;
    }

    const presetChanged = lastSyncedPresetRef.current !== period;

    // A newly selected preset gets a fresh anchor.
    if (presetChanged || !presetSyncAnchorRef.current) {
      presetSyncAnchorRef.current = new Date();
    }

    // Sync when the preset changed or when the parent range is missing.
    const shouldSyncRange = presetChanged || !hasRangeValue(range);

    if (!shouldSyncRange) {
      lastSyncedPresetRef.current = period;
      return;
    }

    const nextRange = resolvePresetRange(period, presetSyncAnchorRef.current);

    // Avoid redundant parent updates when the effective range is already correct.
    if (!isSameDateRange(range, nextRange)) {
      onRangeChange(nextRange);
    }

    lastSyncedPresetRef.current = period;
  }, [onRangeChange, period, range]);

  /**
   * Parent always owns the concrete date range.
   * This effect only backfills or repairs that range when a preset is already selected,
   * such as on initial mount or when external state becomes incomplete.
   */
  useEffect(() => {
    syncRangeFromPreset();
  }, [syncRangeFromPreset]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverAnchor asChild>
        <div ref={ref} className="relative">
          {/* The Select controls only the preset choice, not the concrete range itself. */}
          <Select
            value={safePeriod}
            onValueChange={(value: DateRangePreset) => {
              applyPreset(value);
            }}
          >
            {/* Trigger text is fully controlled by showTextType policy. */}
            <SelectTrigger
              variant={variant}
              className={cn("border-slate-150 h-10", className)}
              title={triggerText}
            >
              <span className="truncate">{triggerText}</span>
            </SelectTrigger>

            <SelectContent
              // Keep focus on the calendar when "range" selection intentionally chains into popover open.
              onCloseAutoFocus={(event) => {
                if (preventSelectFocusRestoreRef.current) {
                  event.preventDefault();
                }
              }}
            >
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

      {/* The calendar is responsible for picking actual dates, while the parent stores the result. */}
      <PopoverContent className="z-[51] w-auto p-0" align="start">
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

// Forward the outer ref to the trigger wrapper so parent components can position or focus around it.
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  Component,
);

DateRangePicker.displayName = "DateRangePicker";
