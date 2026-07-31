"use client";

import { useMemo } from "react";

import { Popover } from "@/components/ui/popover";
import { cn } from "@/shared/utils/presentation";

import { HierarchicalSelectContent } from "./HierarchicalSelectContent";
import { HierarchicalSelectTrigger } from "./HierarchicalSelectTrigger";
import type { HierarchicalSelectProps } from "./types";
import { useHierarchicalSelectNavigation } from "./useHierarchicalSelectNavigation";
import { findItemPath } from "./utils";

const DEFAULT_PLACEHOLDER = "Select an option";
const DEFAULT_EMPTY_TEXT = "No options available.";
const DEFAULT_BACK_LABEL = "Back";

export const HierarchicalSelect = ({
  id,
  value,
  items,
  placeholder = DEFAULT_PLACEHOLDER,
  disabled = false,
  emptyText = DEFAULT_EMPTY_TEXT,
  backLabel = DEFAULT_BACK_LABEL,
  selectableStrategy = "parent-without-children",
  onValueChange,
  getDisplayLabel,
  className,
  triggerClassName,
}: HierarchicalSelectProps) => {
  const {
    open,
    path,
    direction,
    handleOpenChange,
    goForward,
    goBack,
  } = useHierarchicalSelectNavigation();

  const selectedPath = useMemo(
    () => (value ? findItemPath(items, value) : []),
    [items, value],
  );
  const selectedItem = selectedPath[selectedPath.length - 1];
  const selectedValues = useMemo(
    () => new Set(value ? [value] : []),
    [value],
  );
  const displayLabel = selectedItem
    ? (getDisplayLabel?.(selectedItem, selectedPath) ?? selectedItem.label)
    : null;

  const selectItem = (selectedValue: string) => {
    onValueChange(selectedValue);
    handleOpenChange(false);
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <HierarchicalSelectTrigger
          id={id}
          open={open}
          disabled={disabled}
          hasValue={Boolean(displayLabel)}
          className={triggerClassName}
        >
          <span className="min-w-0 truncate">
            {displayLabel ?? placeholder}
          </span>
        </HierarchicalSelectTrigger>

        <HierarchicalSelectContent
          items={items}
          path={path}
          direction={direction}
          selectedValues={selectedValues}
          backLabel={backLabel}
          emptyText={emptyText}
          selectableStrategy={selectableStrategy}
          onBack={goBack}
          onDrill={goForward}
          onSelect={(item) => selectItem(item.value)}
        />
      </Popover>
    </div>
  );
};
