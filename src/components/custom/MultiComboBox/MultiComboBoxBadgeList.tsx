import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/presentation";

import { getBadgeClassName, resolveBadgeVariant } from "./styles";
import type { BadgeVariant, MultiComboBoxItem, PaletteIndex } from "./types";

type MultiComboBoxBadgeListProps = {
  items: MultiComboBoxItem[];
  itemOrderMap?: ReadonlyMap<string, number>;
  badgeVariant?: BadgeVariant;
  paletteStart: PaletteIndex;
  palettePick?: PaletteIndex;
  readOnly?: boolean;
  onRemove?: (value: string) => void;
};

export function MultiComboBoxBadgeList({
  items,
  itemOrderMap,
  badgeVariant,
  paletteStart,
  palettePick,
  readOnly = false,
  onRemove,
}: MultiComboBoxBadgeListProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => (
        <Badge
          key={item.value}
          variant={resolveBadgeVariant(badgeVariant)}
          className={getBadgeClassName(
            badgeVariant,
            itemOrderMap?.get(item.value) ?? index,
            paletteStart,
            palettePick,
            cn("font-medium", readOnly ? undefined : "cursor-pointer"),
          )}
          onClick={(event) => {
            if (readOnly) {
              return;
            }

            event.stopPropagation();
            onRemove?.(item.value);
          }}
        >
          {item.label}
          {!readOnly && <X size={16} />}
        </Badge>
      ))}
    </div>
  );
}
