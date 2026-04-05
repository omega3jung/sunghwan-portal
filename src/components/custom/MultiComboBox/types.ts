import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { badgeVariants } from "@/components/ui/badge";
import type { ValueLabel } from "@/shared/types/options";

import { comboBoxVariants } from "./variants";

export type NativeBadgeVariant = VariantProps<typeof badgeVariants>["variant"];
export type PaletteIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type MultiColorBadgeVariant = "palette" | "overdue";
export type BadgeVariant = NativeBadgeVariant | MultiColorBadgeVariant;
export type ButtonVariant = BadgeVariant;
export type ComboBoxVariant = VariantProps<typeof comboBoxVariants>["variant"];
export type ComboBoxSize = VariantProps<typeof comboBoxVariants>["size"];

/**
 * The base item shape shared by both flat and tree-based combo boxes.
 * Tree variants can extend this type with hierarchical fields such as `children`.
 */
export type MultiComboBoxItem = ValueLabel & {
  disabled?: boolean;
};

export type MultiComboBoxProps = {
  placeholder?: string;
  options?: MultiComboBoxItem[];
  badgeVariant?: BadgeVariant;
  badgeOrderMap?: ReadonlyMap<string, number>;
  paletteStart?: PaletteIndex;
  palettePick?: PaletteIndex;
  onSelect?: (value: string) => void;
  onRemove?: (value: string) => void;
  isLoading?: boolean;
  readOnly?: boolean;
};

export interface ComboBoxProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">,
    MultiComboBoxProps {
  value: string[];
  asChild?: boolean;
  variant?: ComboBoxVariant;
  size?: ComboBoxSize;
}
