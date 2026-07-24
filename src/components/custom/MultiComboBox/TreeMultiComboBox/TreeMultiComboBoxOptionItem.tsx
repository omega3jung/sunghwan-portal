import { Check, ChevronDown, ChevronRight, Minus } from "lucide-react";

import { ComboboxItem } from "@/components/ui/combobox";
import { cn } from "@/shared/utils/presentation";

import type {
  TreeCheckState,
  TreeMultiComboBoxNode,
} from "./types";

type TreeMultiComboBoxOptionItemProps = {
  item: TreeMultiComboBoxNode;
  checkState: TreeCheckState;
  disabled: boolean;
  expanded?: boolean;
  selectedChildCount?: number;
  totalChildCount?: number;
  onToggleExpand?: (value: string) => void;
};

export function TreeMultiComboBoxOptionItem({
  item,
  checkState,
  disabled,
  expanded = false,
  selectedChildCount = 0,
  totalChildCount = 0,
  onToggleExpand,
}: TreeMultiComboBoxOptionItemProps) {
  const isParent = item.kind === "parent";
  const hasChildren = isParent && item.children.length > 0;

  return (
    <ComboboxItem
      value={item}
      disabled={disabled}
      indicator={null}
      aria-expanded={hasChildren ? expanded : undefined}
      className={cn(
        "gap-2 pr-1.5 data-disabled:bg-muted/40 data-disabled:text-muted-foreground",
        isParent ? "font-medium" : "pl-8 font-normal",
      )}
      onKeyDown={(event) => {
        if (!hasChildren) {
          return;
        }

        if (event.key === "ArrowRight" && !expanded) {
          event.preventDefault();
          onToggleExpand?.(item.value);
        }

        if (event.key === "ArrowLeft" && expanded) {
          event.preventDefault();
          onToggleExpand?.(item.value);
        }
      }}
    >
      <span
        aria-hidden
        className="flex size-4 shrink-0 items-center justify-center"
      >
        {checkState === "partial" ? (
          <Minus className="size-4" />
        ) : (
          <Check
            className={cn(
              "size-4",
              checkState === "checked" ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {hasChildren ? (
        <span className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
          {totalChildCount > 0 ? (
            <span>
              {selectedChildCount}/{totalChildCount}
            </span>
          ) : null}
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex size-5 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground"
            aria-label={
              expanded ? `Collapse ${item.label}` : `Expand ${item.label}`
            }
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleExpand?.(item.value);
            }}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        </span>
      ) : null}
    </ComboboxItem>
  );
}
