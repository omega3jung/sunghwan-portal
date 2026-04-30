"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo, useState } from "react";

import { comboBoxVariants } from "@/components/custom/MultiComboBox/variants";
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

import { TreeMultiComboBoxBadgeList } from "./TreeMultiComboBoxBadgeList";
import { TreeMultiComboBoxParentItem } from "./TreeMultiComboBoxParentItem";
import type { TreeMultiComboBoxProps } from "./types";
import {
  createTreeBadgeOrderMap,
  createTreeCommandFilter,
  createTreeOptionIndex,
  EMPTY_OPTION_TEXT,
  getSelectedTreeItems,
  normalizeTreeValues,
  toggleTreeValue,
} from "./utils";

const hasSameValues = (left: string[], right: string[]) => {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);

  return left.every((value) => rightSet.has(value));
};

const Component = (
  {
    placeholder,
    options = [],
    value = [],
    onSelect,
    onRemove,
    onChange,
    variant,
    size,
    badgeVariant,
    paletteStart,
    palettePick,
    isLoading = false,
    disabled = false,
    readOnly = false,
    modal = true,
    className,
    ...buttonProps
  }: TreeMultiComboBoxProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const [search, setSearch] = useState("");
  const [expandedParentValues, setExpandedParentValues] = useState<string[]>(
    [],
  );

  const resolvedBadgeVariant = badgeVariant ?? "default";
  const resolvedPaletteStart = paletteStart ?? 1;
  const resolvedPalettePick = palettePick;

  const normalizedValue = useMemo(
    () => normalizeTreeValues(value, options),
    [options, value],
  );
  const optionIndex = useMemo(() => createTreeOptionIndex(options), [options]);
  const badgeOrderMap = useMemo(
    () => createTreeBadgeOrderMap(options),
    [options],
  );
  const selectedItems = useMemo(
    () => getSelectedTreeItems(normalizedValue, options),
    [normalizedValue, options],
  );
  const commandFilter = useMemo(
    () => createTreeCommandFilter(options),
    [options],
  );

  const isSearching = search.trim().length > 0;

  const toggleExpandedParent = (parentValue: string) => {
    setExpandedParentValues((prev) =>
      prev.includes(parentValue)
        ? prev.filter((value) => value !== parentValue)
        : [...prev, parentValue],
    );
  };

  const emitSelectionChange = (nextValue: string[]) => {
    if (onChange) {
      onChange(nextValue);
      return;
    }

    const currentValueSet = new Set(normalizedValue);
    const nextValueSet = new Set(nextValue);

    for (const removedValue of normalizedValue) {
      if (!nextValueSet.has(removedValue)) {
        onRemove?.(removedValue);
      }
    }

    for (const addedValue of nextValue) {
      if (!currentValueSet.has(addedValue)) {
        onSelect?.(addedValue);
      }
    }
  };

  const handleToggleValue = (targetValue: string) => {
    if (disabled || readOnly) {
      return;
    }

    const nextValue = toggleTreeValue(targetValue, normalizedValue, options);

    if (hasSameValues(normalizedValue, nextValue)) {
      return;
    }

    emitSelectionChange(nextValue);
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
          {!selectedItems.length ? (
            <div className="px-2 font-normal text-muted-foreground">
              {placeholder}
            </div>
          ) : (
            <TreeMultiComboBoxBadgeList
              items={selectedItems}
              itemOrderMap={badgeOrderMap}
              badgeVariant={resolvedBadgeVariant}
              paletteStart={resolvedPaletteStart}
              palettePick={resolvedPalettePick}
              readOnly={readOnly}
              onRemove={handleToggleValue}
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
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={placeholder}
          />
          <CommandList className="max-h-64 min-h-0">
            <CommandEmpty>{EMPTY_OPTION_TEXT}</CommandEmpty>
            <CommandGroup>
              {options.map((parent) => (
                <TreeMultiComboBoxParentItem
                  key={parent.value}
                  item={parent}
                  values={normalizedValue}
                  index={optionIndex}
                  expanded={
                    isSearching || expandedParentValues.includes(parent.value)
                  }
                  onToggleExpand={toggleExpandedParent}
                  onToggleValue={handleToggleValue}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const TreeMultiComboBox = forwardRef<
  HTMLButtonElement,
  TreeMultiComboBoxProps
>(Component);

TreeMultiComboBox.displayName = "TreeMultiComboBox";
