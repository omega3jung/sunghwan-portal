import { Check } from "lucide-react";

import { CommandItem } from "@/components/ui/command";
import type { ValueLabel } from "@/shared/types/options";
import { cn } from "@/shared/utils";

type MultiComboBoxOptionItemProps = {
  item: ValueLabel;
  selected: boolean;
  onSelect: (value: string) => void;
};

export function MultiComboBoxOptionItem({
  item,
  selected,
  onSelect,
}: MultiComboBoxOptionItemProps) {
  return (
    <CommandItem value={item.value} onSelect={() => onSelect(item.value)}>
      <Check
        className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")}
      />
      {item.label}
    </CommandItem>
  );
}
