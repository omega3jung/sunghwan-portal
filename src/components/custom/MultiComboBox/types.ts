import { type VariantProps } from "class-variance-authority";
import React from "react";
import { ValueLabel } from "@/types/common";
import { badgeVariants } from "@/components/ui/badge";
import { comboBoxVariants } from "./variants";

export type ButtonVariant = VariantProps<typeof badgeVariants>["variant"] | "rainbow";

export type Props = {
  placeholder?: string;
  options?: ValueLabel[];
  background?: boolean;
  buttonVariant?: ButtonVariant;
  rainbowStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  rainbowPick?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | undefined;
  onSelect?: (value: string) => void;
  onRemove?: (value: string) => void;
  isLoading?: boolean;
  readOnly?: any;
};

export interface ComboBoxProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onSelect">,
    Props,
    VariantProps<typeof comboBoxVariants> {
  value: string[];
  asChild?: boolean;
}
