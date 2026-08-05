"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button, type ButtonProps } from "@/components/ui/button";
import { NS } from "@/lib/application/i18n";

import { useColorPickerContext } from "./ColorPickerContext";

export type ColorPickerResetProps = {
  children?: ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export const ColorPickerReset = ({
  children,
  className,
  variant = "outline",
  size = "md",
}: ColorPickerResetProps) => {
  const { t } = useTranslation(NS.component, {
    keyPrefix: "colorPicker",
  });
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
      {children ?? t("reset")}
    </Button>
  );
};
