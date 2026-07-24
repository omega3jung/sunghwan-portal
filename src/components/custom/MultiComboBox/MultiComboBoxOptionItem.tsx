import { ComboboxItem } from "@/components/ui/combobox";

import type { MultiComboBoxItem } from "./types";

type MultiComboBoxOptionItemProps = {
  item: MultiComboBoxItem;
};

export function MultiComboBoxOptionItem({
  item,
}: MultiComboBoxOptionItemProps) {
  return (
    <ComboboxItem
      value={item}
      disabled={item.disabled}
      className="data-disabled:bg-muted/40 data-disabled:text-muted-foreground"
    >
      {item.label}
    </ComboboxItem>
  );
}
