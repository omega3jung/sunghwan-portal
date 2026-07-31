"use client";

import { Loader2, X } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { cn } from "@/shared/utils/presentation";

import { HierarchicalSelectContent } from "./HierarchicalSelectContent";
import { HierarchicalSelectTrigger } from "./HierarchicalSelectTrigger";
import type { MultiHierarchicalSelectProps } from "./types";
import { useHierarchicalSelectNavigation } from "./useHierarchicalSelectNavigation";
import { createItemPathMap } from "./utils";

const DEFAULT_PLACEHOLDER = "Select options";
const DEFAULT_EMPTY_TEXT = "No options available.";
const DEFAULT_BACK_LABEL = "Back";

export const MultiHierarchicalSelect = ({
  id,
  value,
  items,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  readOnly = false,
  isLoading = false,
  emptyText = DEFAULT_EMPTY_TEXT,
  backLabel = DEFAULT_BACK_LABEL,
  selectableStrategy = "parent-without-children",
  onValueChange,
  getDisplayLabel,
  badgeVariant = "secondary",
  className,
  triggerClassName,
}: MultiHierarchicalSelectProps) => {
  const {
    open,
    path,
    direction,
    handleOpenChange,
    goForward,
    goBack,
  } = useHierarchicalSelectNavigation();

  const selectedValues = useMemo(() => new Set(value), [value]);
  const itemPathMap = useMemo(() => createItemPathMap(items), [items]);
  const selectedItems = useMemo(
    () =>
      value.map((selectedValue) => {
        const selectedPath = itemPathMap.get(selectedValue);
        const selectedItem = selectedPath?.[selectedPath.length - 1];

        return {
          value: selectedValue,
          label: selectedItem
            ? (getDisplayLabel?.(selectedItem, selectedPath) ??
              selectedItem.label)
            : selectedValue,
        };
      }),
    [getDisplayLabel, itemPathMap, value],
  );

  const toggleValue = (selectedValue: string) => {
    onValueChange(
      selectedValues.has(selectedValue)
        ? value.filter((currentValue) => currentValue !== selectedValue)
        : [...value, selectedValue],
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <HierarchicalSelectTrigger
          id={id}
          open={open}
          disabled={disabled || readOnly}
          hasValue={selectedItems.length > 0}
          icon={
            isLoading ? (
              <Loader2 className="pointer-events-none size-4 animate-spin" />
            ) : undefined
          }
          className={cn("h-auto min-h-8 py-1", triggerClassName)}
        >
          {selectedItems.length === 0 ? (
            <span className="min-w-0 truncate">{placeholder}</span>
          ) : (
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
              {selectedItems.map((item) => (
                <Badge
                  key={item.value}
                  variant={badgeVariant}
                  className={cn(!readOnly && "cursor-pointer")}
                  onClick={(event) => {
                    if (readOnly) {
                      return;
                    }

                    event.stopPropagation();
                    toggleValue(item.value);
                  }}
                >
                  {item.label}
                  {!readOnly && <X aria-hidden className="size-3" />}
                </Badge>
              ))}
            </span>
          )}
        </HierarchicalSelectTrigger>

        <HierarchicalSelectContent
          items={items}
          path={path}
          direction={direction}
          selectedValues={selectedValues}
          backLabel={backLabel}
          emptyText={emptyText}
          selectableStrategy={selectableStrategy}
          multiple
          onBack={goBack}
          onDrill={goForward}
          onSelect={(item) => toggleValue(item.value)}
        />
      </Popover>
    </div>
  );
};
