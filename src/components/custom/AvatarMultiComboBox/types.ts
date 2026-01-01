import { type VariantProps } from "class-variance-authority";

import { ImageValueLabel } from "@/types/common";

import { comboBoxVariants } from "./variants";

export type AvatarMultiComboBoxProps = {
  placeholder?: string;
  options?: ImageValueLabel[];
  background?: boolean;
  onSelect?: (value: string) => void;
  onRemove?: (value: string) => void;
  isLoading?: boolean;
  readOnly?: any;
  maxImages?: number;
};

export interface Props
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">,
    AvatarMultiComboBoxProps,
    VariantProps<typeof comboBoxVariants> {
  value: string[];
  asChild?: boolean;
}
