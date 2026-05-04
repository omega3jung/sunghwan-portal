import { ChevronDown, ChevronRight } from "lucide-react";

import { cn } from "@/shared/utils/presentation";

import { TreeMultiComboBoxChildItem } from "./TreeMultiComboBoxChildItem";
import { TreeMultiComboBoxOptionItem } from "./TreeMultiComboBoxOptionItem";
import type {
  TreeMultiComboBoxOption,
  TreeMultiComboBoxOptionIndex,
  TreeMultiComboBoxValue,
} from "./types";
import { getParentRenderState } from "./utils";

type TreeMultiComboBoxParentItemProps = {
  item: TreeMultiComboBoxOption;
  values: TreeMultiComboBoxValue;
  index: TreeMultiComboBoxOptionIndex;
  expanded: boolean;
  onToggleExpand: (value: string) => void;
  onToggleValue: (value: string) => void;
};

export function TreeMultiComboBoxParentItem({
  item,
  values,
  index,
  expanded,
  onToggleExpand,
  onToggleValue,
}: TreeMultiComboBoxParentItemProps) {
  const parentState = getParentRenderState(item, values);
  const hasChildren = parentState.item.children.length > 0;

  return (
    <div className="space-y-1">
      <TreeMultiComboBoxOptionItem
        value={parentState.item.value}
        label={parentState.item.label}
        checkState={parentState.checkState}
        disabled={parentState.disabled}
        depth={0}
        rightAdornment={
          hasChildren ? (
            <div className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
              {parentState.totalChildCount > 0 && (
                <span>
                  {parentState.selectedChildCount}/{parentState.totalChildCount}
                </span>
              )}
              <button
                type="button"
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-accent hover:text-accent-foreground",
                  parentState.item.children.length === 0 &&
                    "pointer-events-none opacity-40",
                )}
                aria-label={
                  expanded
                    ? `Collapse ${parentState.item.label}`
                    : `Expand ${parentState.item.label}`
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggleExpand(parentState.item.value);
                }}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : undefined
        }
        onSelect={onToggleValue}
      />

      {expanded &&
        parentState.item.children.map((child) => (
          <TreeMultiComboBoxChildItem
            key={child.value}
            item={child}
            values={values}
            index={index}
            onToggleValue={onToggleValue}
          />
        ))}
    </div>
  );
}
