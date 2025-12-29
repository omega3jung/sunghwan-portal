import { VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

import { ValueLabel } from "@/types";

import { comboBoxVariants } from "./variants";

export type ComboBoxProps = {
  placeholder?: string;
  options?: ValueLabel[];
  clearOnRepick?: boolean;
  icon?: ReactNode;
  isLoading?: boolean;
  readOnly?: boolean;
  hideCheck?: boolean;

  onChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
};

type PartialButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "value" | "defaultValue"
>;

export interface Props
  extends PartialButtonProps,
    ComboBoxProps,
    VariantProps<typeof comboBoxVariants> {}
