import type { BadgeProps } from "@/components/ui/badge";
import { cn } from "@/shared/utils";

import type {
  BadgeVariant,
  MultiColorBadgeVariant,
  NativeBadgeVariant,
  PaletteIndex,
} from "./types";

export const multiComboBoxPalette: Record<PaletteIndex, string> = {
  1: "border-transparent bg-[#CDFFDA] text-[#377D22] hover:bg-[#CDFFDA]",
  2: "border-transparent bg-[#F0F6FF] text-[#36A2EB] hover:bg-[#F0F6FF]",
  3: "border-transparent bg-[#FFDBE2] text-[#FF6384] hover:bg-[#FFDBE2]",
  4: "border-transparent bg-[#FFFAC5] text-[#FF9F40] hover:bg-[#FFFAC5]",
  5: "border-transparent bg-[#DCF2F0] text-[#29B2B2] hover:bg-[#DCF2F0]",
  6: "border-transparent bg-[#FAF1FF] text-[#9966FF] hover:bg-[#FAF1FF]",
  7: "border-transparent bg-[#FFEADB] text-[#784315] hover:bg-[#FFEADB]",
  8: "border-transparent bg-[#FFD9ED] text-[#EF88BE] hover:bg-[#FFD9ED]",
  9: "border-transparent bg-[#DAE8FF] text-[#00129A] hover:bg-[#DAE8FF]",
  10: "border-transparent bg-[#EDEDED] text-[#212121] hover:bg-[#EDEDED]",
};

const customBadgeVariantClasses: Record<
  Exclude<MultiColorBadgeVariant, "palette">,
  string
> = {
  overdue: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100",
};

const nativeBadgeVariants = new Set<NativeBadgeVariant>([
  "default",
  "secondary",
  "destructive",
  "outline",
]);

export const isPaletteBadgeVariant = (variant?: BadgeVariant): boolean => {
  return variant === "palette";
};

export const normalizePaletteIndex = (value: number): PaletteIndex => {
  const paletteSize = Object.keys(multiComboBoxPalette).length;
  const normalizedValue = ((value - 1) % paletteSize + paletteSize) % paletteSize;

  return (normalizedValue + 1) as PaletteIndex;
};

export const resolvePaletteIndex = (
  itemIndex: number,
  paletteStart: PaletteIndex,
  palettePick?: PaletteIndex,
): PaletteIndex => {
  if (palettePick) {
    return palettePick;
  }

  return normalizePaletteIndex(paletteStart + itemIndex);
};

export const resolveBadgeVariant = (
  variant?: BadgeVariant,
): BadgeProps["variant"] => {
  if (variant && nativeBadgeVariants.has(variant as NativeBadgeVariant)) {
    return variant as NativeBadgeVariant;
  }

  return "secondary";
};

export const resolveBadgeClassName = (
  variant: BadgeVariant | undefined,
  itemIndex: number,
  paletteStart: PaletteIndex,
  palettePick?: PaletteIndex,
): string | undefined => {
  if (isPaletteBadgeVariant(variant)) {
    const paletteIndex = resolvePaletteIndex(itemIndex, paletteStart, palettePick);

    return multiComboBoxPalette[paletteIndex];
  }

  if (variant && variant in customBadgeVariantClasses) {
    return customBadgeVariantClasses[variant as keyof typeof customBadgeVariantClasses];
  }

  return undefined;
};

export const getBadgeClassName = (
  variant: BadgeVariant | undefined,
  itemIndex: number,
  paletteStart: PaletteIndex,
  palettePick?: PaletteIndex,
  className?: string,
) => {
  return cn(
    "flex h-6 gap-2 rounded-lg pr-1 text-nowrap",
    resolveBadgeClassName(variant, itemIndex, paletteStart, palettePick),
    className,
  );
};
