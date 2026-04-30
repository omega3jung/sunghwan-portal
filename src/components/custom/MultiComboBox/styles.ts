import type { BadgeProps } from "@/components/ui/badge";
import { cn } from "@/shared/utils/presentation";

import type {
  BadgeVariant,
  MultiColorBadgeVariant,
  NativeBadgeVariant,
  PaletteIndex,
} from "./types";

export const multiComboBoxPalette: Record<PaletteIndex, string> = {
  1: "border-transparent bg-[#E6F6EC] text-[#2E7D4F] hover:bg-[#E6F6EC]", // green
  2: "border-transparent bg-[#EAF2FF] text-[#2F6FD6] hover:bg-[#EAF2FF]", // blue
  3: "border-transparent bg-[#FCEDEE] text-[#C94A5A] hover:bg-[#FCEDEE]", // muted red
  4: "border-transparent bg-[#FFF4E5] text-[#C7771A] hover:bg-[#FFF4E5]", // muted orange
  5: "border-transparent bg-[#E8F7F6] text-[#2C9C9C] hover:bg-[#E8F7F6]", // teal
  6: "border-transparent bg-[#F2ECFF] text-[#7A5AE0] hover:bg-[#F2ECFF]", // purple
  7: "border-transparent bg-[#F5EFEA] text-[#7A5230] hover:bg-[#F5EFEA]", // brown
  8: "border-transparent bg-[#F9EDF5] text-[#C05A9B] hover:bg-[#F9EDF5]", // muted pink
  9: "border-transparent bg-[#E9F0FF] text-[#2B4EA2] hover:bg-[#E9F0FF]", // deep blue
  10: "border-transparent bg-[#F3F3F3] text-[#424242] hover:bg-[#F3F3F3]", // gray
};

export const multiComboBoxPaletteAccent: Record<PaletteIndex, string> = {
  1: "bg-[#7ED9A3]", // green accent
  2: "bg-[#8BB8FF]", // blue accent
  3: "bg-[#F28A9A]", // muted red accent
  4: "bg-[#F5B66A]", // orange accent
  5: "bg-[#6ECFCF]", // teal accent
  6: "bg-[#B39DFF]", // purple accent
  7: "bg-[#C89A6B]", // brown accent
  8: "bg-[#E79AC6]", // muted pink accent
  9: "bg-[#6F8FEF]", // deep blue accent
  10: "bg-[#BDBDBD]", // gray accent
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
  const normalizedValue =
    (((value - 1) % paletteSize) + paletteSize) % paletteSize;

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
    const paletteIndex = resolvePaletteIndex(
      itemIndex,
      paletteStart,
      palettePick,
    );

    return multiComboBoxPalette[paletteIndex];
  }

  if (variant && variant in customBadgeVariantClasses) {
    return customBadgeVariantClasses[
      variant as keyof typeof customBadgeVariantClasses
    ];
  }

  return undefined;
};

export const resolveBadgeAccentClassName = (
  variant: BadgeVariant | undefined,
  itemIndex: number,
  paletteStart: PaletteIndex,
  palettePick?: PaletteIndex,
): string | undefined => {
  if (!isPaletteBadgeVariant(variant)) {
    return undefined;
  }

  const paletteIndex = resolvePaletteIndex(
    itemIndex,
    paletteStart,
    palettePick,
  );

  return multiComboBoxPaletteAccent[paletteIndex];
};

export const getBadgeClassName = (
  variant: BadgeVariant | undefined,
  itemIndex: number,
  paletteStart: PaletteIndex,
  palettePick?: PaletteIndex,
  className?: string,
) => {
  return cn(
    "flex h-6 items-center gap-1.5 rounded-md border border-black/[0.04] pr-1 text-nowrap shadow-none",
    resolveBadgeClassName(variant, itemIndex, paletteStart, palettePick),
    className,
  );
};
