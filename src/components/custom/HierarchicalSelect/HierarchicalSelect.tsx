"use client";

import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/shared/utils/presentation";

import type { HierarchicalSelectItem, HierarchicalSelectProps } from "./types";

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
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<HierarchicalSelectItem[]>([]);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const selectedPath = useMemo(
    () => (value ? findItemPath(items, value) : []),
    [items, value],
  );
  const selectedItem = selectedPath[selectedPath.length - 1];
  const displayLabel = selectedItem
    ? (getDisplayLabel?.(selectedItem, selectedPath) ?? selectedItem.label)
    : null;
  const currentItems =
    path.length === 0 ? items : (path[path.length - 1]?.children ?? []);
  const currentPathKey = path.map((item) => item.value).join("/") || "root";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setPath([]);
      setDirection("forward");
    }
  };

  const goForward = (item: HierarchicalSelectItem) => {
    setDirection("forward");
    setPath((prev) => [...prev, item]);
  };

  const goBack = () => {
    setDirection("back");
    setPath((prev) => prev.slice(0, -1));
  };

  const selectItem = (item: HierarchicalSelectItem) => {
    onValueChange(item.value);
    handleOpenChange(false);
  };

  const handleItemClick = (item: HierarchicalSelectItem) => {
    if (item.disabled) {
      return;
    }

    if (shouldDrillDown(item, selectableStrategy)) {
      goForward(item);
      return;
    }

    if (isSelectable(item, selectableStrategy)) {
      selectItem(item);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between border-input bg-transparent px-3 font-normal",
              !displayLabel && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <span className="min-w-0 truncate">
              {displayLabel ?? placeholder}
            </span>
            <ChevronDown className="opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="max-h-80 w-[var(--radix-popover-trigger-width)] overflow-y-auto overflow-x-hidden p-1"
          role="listbox"
        >
          <div
            key={currentPathKey}
            className={cn(
              direction === "forward"
                ? "animate-in fade-in slide-in-from-right-4 duration-150"
                : "animate-in fade-in slide-in-from-left-4 duration-150",
            )}
          >
            {path.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start px-3 font-normal"
                onClick={goBack}
              >
                <ChevronLeft className="size-4" />
                <span className="min-w-0 truncate">{backLabel}</span>
              </Button>
            )}

            {currentItems.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              currentItems.map((item) => (
                <HierarchicalSelectOption
                  key={item.value}
                  item={item}
                  selected={item.value === value}
                  selectable={isSelectable(item, selectableStrategy)}
                  drillable={hasChildren(item)}
                  onClick={() => handleItemClick(item)}
                  onSelect={() => selectItem(item)}
                  onDrill={() => goForward(item)}
                />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

type HierarchicalSelectOptionProps = {
  item: HierarchicalSelectItem;
  selected: boolean;
  selectable: boolean;
  drillable: boolean;
  onClick: () => void;
  onSelect: () => void;
  onDrill: () => void;
};

const HierarchicalSelectOption = ({
  item,
  selected,
  selectable,
  drillable,
  onClick,
  onSelect,
  onDrill,
}: HierarchicalSelectOptionProps) => {
  if (selectable && drillable) {
    return (
      <div
        className={cn(
          "flex w-full items-center rounded-md",
          selected && selectedOptionClassName,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          role="option"
          aria-selected={selected}
          disabled={item.disabled}
          className={cn("min-w-0 flex-1", optionButtonClassName)}
          onClick={onSelect}
        >
          <span className={optionLabelClassName}>{item.label}</span>
          {selected && <Check className="size-4" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={item.disabled}
          aria-label={item.label}
          onClick={onDrill}
        >
          <ChevronRight className="size-4 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      role="option"
      aria-selected={selected}
      disabled={item.disabled || (!selectable && !drillable)}
      className={cn(
        "w-full",
        optionButtonClassName,
        selected && selectedOptionClassName,
      )}
      onClick={onClick}
    >
      <span className={optionLabelClassName}>{item.label}</span>
      {drillable ? (
        <ChevronRight className="size-4 text-muted-foreground" />
      ) : (
        selected && <Check className="size-4" />
      )}
    </Button>
  );
};

const optionButtonClassName = "justify-between px-3 font-normal";
const optionLabelClassName = "min-w-0 truncate text-left";
const selectedOptionClassName = "bg-accent/70 text-accent-foreground";

const hasChildren = (item: HierarchicalSelectItem) =>
  (item.children?.length ?? 0) > 0;

const isSelectable = (
  item: HierarchicalSelectItem,
  selectableStrategy: HierarchicalSelectProps["selectableStrategy"],
) => {
  if (item.disabled) {
    return false;
  }

  if (selectableStrategy === "all") {
    return true;
  }

  return !hasChildren(item);
};

const shouldDrillDown = (
  item: HierarchicalSelectItem,
  selectableStrategy: HierarchicalSelectProps["selectableStrategy"],
) => hasChildren(item) && selectableStrategy !== "all";

const findItemPath = (
  items: HierarchicalSelectItem[],
  targetValue: string,
  path: HierarchicalSelectItem[] = [],
): HierarchicalSelectItem[] => {
  for (const item of items) {
    const nextPath = [...path, item];

    if (item.value === targetValue) {
      return nextPath;
    }

    const childPath = findItemPath(item.children ?? [], targetValue, nextPath);

    if (childPath.length > 0) {
      return childPath;
    }
  }

  return [];
};
