"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Popover } from "@/components/ui/popover";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { HierarchicalSelectContent } from "./HierarchicalSelectContent";
import { HierarchicalSelectTrigger } from "./HierarchicalSelectTrigger";
import type { HierarchicalSelectProps } from "./types";
import { useHierarchicalSelectNavigation } from "./useHierarchicalSelectNavigation";
import { findItemPath } from "./utils";

/**
 * Controlled single-value selector that navigates one tree level at a time.
 * `selectableStrategy` decides whether a node selects immediately or only
 * drills into its children.
 */
export const HierarchicalSelect = ({
  id,
  value,
  items,
  placeholder,
  disabled = false,
  emptyText,
  backLabel,
  selectableStrategy = "parent-without-children",
  onValueChange,
  getDisplayLabel,
  className,
  triggerClassName,
}: HierarchicalSelectProps) => {
  const { t } = useTranslation(NS.component, {
    keyPrefix: "hierarchicalSelect",
  });
  const resolvedPlaceholder = placeholder ?? t("singlePlaceholder");
  const resolvedEmptyText = emptyText ?? t("empty");
  const resolvedBackLabel = backLabel ?? t("back");
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
            {displayLabel ?? resolvedPlaceholder}
          </span>
        </HierarchicalSelectTrigger>

        <HierarchicalSelectContent
          items={items}
          path={path}
          direction={direction}
          selectedValues={selectedValues}
          backLabel={resolvedBackLabel}
          emptyText={resolvedEmptyText}
          selectableStrategy={selectableStrategy}
          onBack={goBack}
          onDrill={goForward}
          onSelect={(item) => selectItem(item.value)}
        />
      </Popover>
    </div>
  );
};
