import { Check, Minus } from "lucide-react";
import type { ReactNode } from "react";

import { CommandItem } from "@/components/ui/command";
import { cn } from "@/shared/utils/presentation";

import type { TreeCheckState } from "./types";

type TreeMultiComboBoxOptionItemProps = {
  value: string;
  label: string;
  selected?: boolean;
  checkState?: TreeCheckState;
  disabled?: boolean;
  depth?: 0 | 1;
  className?: string;
  rightAdornment?: ReactNode;
  onSelect: (value: string) => void;
};

export function TreeMultiComboBoxOptionItem({
  value,
  label,
  selected = false,
  checkState,
  disabled = false,
  depth = 0,
  className,
  rightAdornment,
  onSelect,
}: TreeMultiComboBoxOptionItemProps) {
  const isPartial = checkState === "partial";
  const isChecked = checkState === "checked" || selected;

  return (
    <CommandItem
      value={value}
      disabled={disabled}
      className={cn(
        "gap-2 data-[disabled=true]:bg-muted/40 data-[disabled=true]:text-muted-foreground",
        depth === 0 ? "font-medium" : "pl-8 font-normal",
        className,
      )}
      onSelect={() => onSelect(value)}
    >
      <span className="flex h-4 w-4 items-center justify-center">
        {isPartial ? (
          <Minus className="h-4 w-4 opacity-100" />
        ) : (
          <Check
            className={cn("h-4 w-4", isChecked ? "opacity-100" : "opacity-0")}
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {rightAdornment}
    </CommandItem>
  );
}
