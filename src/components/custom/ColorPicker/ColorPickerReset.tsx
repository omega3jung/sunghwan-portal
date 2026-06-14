"use client";

import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

import { useColorPickerContext } from "./ColorPickerContext";

export type ColorPickerResetProps = {
  children?: ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export const ColorPickerReset = ({
  children = "Reset",
  className,
  variant = "outline",
  size = "default",
}: ColorPickerResetProps) => {
  const { resolvedDefaultValue, disabled, onChange } = useColorPickerContext();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => onChange(resolvedDefaultValue)}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};
