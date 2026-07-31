import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/shared/utils/presentation";

import type {
  HierarchicalSelectItem,
  HierarchicalSelectSelectableStrategy,
} from "./types";

type HierarchicalSelectContentProps = {
  items: HierarchicalSelectItem[];
  path: HierarchicalSelectItem[];
  direction: "forward" | "back";
  selectedValues: ReadonlySet<string>;
  backLabel: string;
  emptyText: string;
  selectableStrategy: HierarchicalSelectSelectableStrategy;
  multiple?: boolean;
  onBack: () => void;
  onDrill: (item: HierarchicalSelectItem) => void;
  onSelect: (item: HierarchicalSelectItem) => void;
};

export const HierarchicalSelectContent = ({
  items,
  path,
  direction,
  selectedValues,
  backLabel,
  emptyText,
  selectableStrategy,
  multiple = false,
  onBack,
  onDrill,
  onSelect,
}: HierarchicalSelectContentProps) => {
  const currentItems =
    path.length === 0 ? items : (path[path.length - 1]?.children ?? []);
  const currentPathKey = path.map((item) => item.value).join("/") || "root";

  const handleItemClick = (item: HierarchicalSelectItem) => {
    if (item.disabled) {
      return;
    }

    if (shouldDrillDown(item, selectableStrategy)) {
      onDrill(item);
      return;
    }

    if (isSelectable(item, selectableStrategy)) {
      onSelect(item);
    }
  };

  return (
    <PopoverContent
      align="start"
      className="max-h-80 w-(--anchor-width) overflow-y-auto overflow-x-hidden p-1"
      role="listbox"
      aria-multiselectable={multiple || undefined}
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
            onClick={onBack}
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
              selected={selectedValues.has(item.value)}
              selectable={isSelectable(item, selectableStrategy)}
              drillable={hasChildren(item)}
              onClick={() => handleItemClick(item)}
              onSelect={() => onSelect(item)}
              onDrill={() => onDrill(item)}
            />
          ))
        )}
      </div>
    </PopoverContent>
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
  selectableStrategy: HierarchicalSelectSelectableStrategy,
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
  selectableStrategy: HierarchicalSelectSelectableStrategy,
) => hasChildren(item) && selectableStrategy !== "all";
