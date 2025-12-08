import { type VariantProps } from "class-variance-authority";
import { comboBoxVariants } from "./variants";
import { ImageValueLabel } from "@/types/common";

export type AvatarMultiComboboxProps = {
  placeholder?: string;
  options?: ImageValueLabel[];
  background?: boolean;
  onSelect?: (value: string) => void;
  onRemove?: (value: string) => void;
  isLoading?: boolean;
  readOnly?: any;
  maxImages?: number;
};

export interface ComboBoxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">,
    AvatarMultiComboboxProps,
    VariantProps<typeof comboBoxVariants> {
  value: string[];
  asChild?: boolean;
}
