import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import type { ImageValueLabel } from "@/shared/types/options";

import { badgeVariants, comboBoxVariants } from "./variants";

export type ComboBoxVariant = VariantProps<typeof comboBoxVariants>["variant"];
export type ComboBoxSize = VariantProps<typeof comboBoxVariants>["size"];
export type BadgeVariant = VariantProps<typeof badgeVariants>["badgeVariant"];

export type AvatarMultiComboBoxProps = {
  placeholder?: string;
  placeholderClassName?: string;
  options?: ImageValueLabel[];
  background?: boolean;
  onSelect?: (value: string) => void;
  onRemove?: (value: string) => void;
  isLoading?: boolean;
  readOnly?: boolean;
  maxImages?: number;
};

export interface Props
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">,
    AvatarMultiComboBoxProps {
  value: string[];
  asChild?: boolean;
  variant?: ComboBoxVariant;
  badgeVariant?: BadgeVariant;
  size?: ComboBoxSize;
  modal?: boolean;
}
