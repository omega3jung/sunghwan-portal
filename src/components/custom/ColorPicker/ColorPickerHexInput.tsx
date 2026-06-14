"use client";

import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils/presentation";

import { useColorPickerContext } from "./ColorPickerContext";

export type ColorPickerHexInputProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "disabled" | "placeholder" | "type"
>;

export const ColorPickerHexInput = ({
  className,
  ...props
}: ColorPickerHexInputProps) => {
  const { value, onChange, placeholder, disabled } = useColorPickerContext();

  return (
    <Input
      {...props}
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn("w-32 min-w-20 flex-1 font-mono", className)}
    />
  );
};
