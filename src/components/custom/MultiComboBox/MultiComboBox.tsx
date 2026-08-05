"use client";

import { Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { MultiComboBoxBadgeList } from "./MultiComboBoxBadgeList";
import { MultiComboBoxOptionItem } from "./MultiComboBoxOptionItem";
import type { ComboBoxProps } from "./types";
import {
  createComboboxFilter,
  createOptionOrderMap,
  getSelectedOptions,
} from "./utils";
import { comboBoxVariants } from "./variants";

const Component = (
  {
    placeholder,
    options = [],
    value = [],
    onSelect,
    onRemove,
    variant,
    size,
    badgeVariant,
    badgeOrderMap,
    paletteStart,
    palettePick,
    isLoading = false,
    disabled = false,
    readOnly = false,
    modal = true,
    className,
    ...buttonProps
  }: ComboBoxProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { t } = useTranslation(NS.component, {
    keyPrefix: "comboBox",
  });
  const resolvedBadgeVariant = badgeVariant ?? "default";
  const resolvedPaletteStart = paletteStart ?? 1;
  const resolvedPalettePick = palettePick;

  const selectedOptions = useMemo(
    () => getSelectedOptions(options, value),
    [options, value],
  );
  const optionOrderMap = useMemo(
    () => badgeOrderMap ?? createOptionOrderMap(options),
    [badgeOrderMap, options],
  );
  const comboboxFilter = useMemo(() => createComboboxFilter(), []);

  const handleValueChange = (nextOptions: typeof options) => {
    const currentValueSet = new Set(value);
    const optionValueSet = new Set(options.map((option) => option.value));
    const nextValueSet = new Set(nextOptions.map((option) => option.value));

    for (const removedValue of value) {
      if (optionValueSet.has(removedValue) && !nextValueSet.has(removedValue)) {
        onRemove?.(removedValue);
      }
    }

    for (const addedValue of nextValueSet) {
      if (!currentValueSet.has(addedValue)) {
        onSelect?.(addedValue);
      }
    }
  };

  return (
    <Combobox
      items={options}
      value={selectedOptions}
      onValueChange={handleValueChange}
      filter={comboboxFilter}
      multiple
      disabled={disabled}
      readOnly={readOnly}
      modal={modal}
    >
      <ComboboxTrigger
        render={
          <Button
            {...buttonProps}
            ref={ref}
            variant="outline"
            type="button"
            className={cn(comboBoxVariants({ variant, size }), className)}
            disabled={disabled || readOnly}
          />
        }
        icon={
          isLoading ? (
            <Loader2 className="pointer-events-none size-5 animate-spin" />
          ) : readOnly ? null : undefined
        }
      >
        {!selectedOptions.length ? (
          <div className="px-2 font-normal text-muted-foreground">
            {placeholder}
          </div>
        ) : (
          <MultiComboBoxBadgeList
            items={selectedOptions}
            itemOrderMap={optionOrderMap}
            badgeVariant={resolvedBadgeVariant}
            paletteStart={resolvedPaletteStart}
            palettePick={resolvedPalettePick}
            readOnly={readOnly}
            onRemove={onRemove}
          />
        )}
      </ComboboxTrigger>

      <ComboboxContent>
        <ComboboxInput
          aria-label={placeholder ?? t("searchOptions")}
          placeholder={placeholder}
          showTrigger={false}
        />
        <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
        <ComboboxList showScrollbar className="max-h-48 min-h-0">
          {(item) => <MultiComboBoxOptionItem key={item.value} item={item} />}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

export const MultiComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(
  Component,
);

MultiComboBox.displayName = "MultiComboBox";
