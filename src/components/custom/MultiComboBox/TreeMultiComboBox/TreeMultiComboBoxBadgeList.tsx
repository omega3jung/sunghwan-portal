import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/presentation";

import {
  getBadgeClassName,
  resolveBadgeAccentClassName,
  resolveBadgeVariant,
} from "../styles";
import type { BadgeVariant, PaletteIndex } from "../types";
import type { TreeMultiComboBoxSelectedItem } from "./types";

type TreeMultiComboBoxBadgeListProps = {
  items: TreeMultiComboBoxSelectedItem[];
  itemOrderMap?: ReadonlyMap<string, number>;
  badgeVariant?: BadgeVariant;
  paletteStart: PaletteIndex;
  palettePick?: PaletteIndex;
  readOnly?: boolean;
  onRemove?: (value: string) => void;
};

export function TreeMultiComboBoxBadgeList({
  items,
  itemOrderMap,
  badgeVariant,
  paletteStart,
  palettePick,
  readOnly = false,
  onRemove,
}: TreeMultiComboBoxBadgeListProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => {
        const itemOrder = itemOrderMap?.get(item.value) ?? index;
        const parentAccentClassName =
          item.kind === "child" && itemOrderMap?.has(item.parentValue)
            ? resolveBadgeAccentClassName(
                badgeVariant,
                itemOrderMap.get(item.parentValue) ?? index,
                paletteStart,
                palettePick,
              )
            : undefined;

        return (
          <Badge
            key={item.value}
            variant={resolveBadgeVariant(badgeVariant)}
            className={getBadgeClassName(
              badgeVariant,
              itemOrder,
              paletteStart,
              palettePick,
              cn(
                "relative overflow-hidden",
                item.kind === "parent" &&
                  "font-semibold ring-1 ring-inset ring-white/30",
                item.kind === "child" && "pl-3 font-medium",
                readOnly ? undefined : "cursor-pointer",
              ),
            )}
            onClick={(event) => {
              if (readOnly) {
                return;
              }

              event.stopPropagation();
              onRemove?.(item.value);
            }}
          >
            {item.kind === "child" && parentAccentClassName ? (
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-0 left-0 w-2.5 rounded-l-md border-r-2 opacity-90",
                  parentAccentClassName,
                )}
              />
            ) : null}
            {item.label}
            {!readOnly && <X size={16} />}
          </Badge>
        );
      })}
    </div>
  );
}
