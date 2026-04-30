"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/shared/utils/presentation";

import { MultiComboBoxBadgeList } from "./MultiComboBoxBadgeList";
import { MultiComboBoxOptionItem } from "./MultiComboBoxOptionItem";
import type { ComboBoxProps } from "./types";
import {
  createCommandFilter,
  createOptionOrderMap,
  EMPTY_OPTION_TEXT,
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
  const commandFilter = useMemo(() => createCommandFilter(options), [options]);

  const handleToggleOption = (selection: string) => {
    const selectedOption = options.find((item) => item.value === selection);

    if (selectedOption?.disabled) {
      return;
    }

    if (value.includes(selection)) {
      onRemove?.(selection);
      return;
    }

    onSelect?.(selection);
  };

  return (
    <Popover modal={modal}>
      <PopoverTrigger asChild>
        <Button
          {...buttonProps}
          ref={ref}
          variant="outline"
          role="combobox"
          type="button"
          className={cn(comboBoxVariants({ variant, size }), className)}
          disabled={disabled || readOnly}
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

          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : !readOnly ? (
            <ChevronDown className="ml-2 mr-2 h-4 w-4 shrink-0 text-basic" />
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command filter={commandFilter}>
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-48 min-h-0">
            <CommandEmpty>{EMPTY_OPTION_TEXT}</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <MultiComboBoxOptionItem
                  key={item.value}
                  item={item}
                  selected={value.includes(item.value)}
                  onSelect={handleToggleOption}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const MultiComboBox = forwardRef<HTMLButtonElement, ComboBoxProps>(
  Component,
);

MultiComboBox.displayName = "MultiComboBox";
