import { Check } from "lucide-react";

import { CommandItem } from "@/components/ui/command";
import { cn } from "@/shared/utils/presentation";

import type { MultiComboBoxItem } from "./types";

type MultiComboBoxOptionItemProps = {
  item: MultiComboBoxItem;
  selected: boolean;
  onSelect: (value: string) => void;
};

export function MultiComboBoxOptionItem({
  item,
  selected,
  onSelect,
}: MultiComboBoxOptionItemProps) {
  return (
    <CommandItem
      value={item.value}
      disabled={item.disabled}
      className="data-[disabled=true]:bg-muted/40 data-[disabled=true]:text-muted-foreground"
      onSelect={() => onSelect(item.value)}
    >
      <Check
        className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")}
      />
      {item.label}
    </CommandItem>
  );
}
