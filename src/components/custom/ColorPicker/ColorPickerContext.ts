"use client";

import { createContext, useContext } from "react";

import { resolveCssColorValue } from "@/shared/utils/presentation";

const FALLBACK_DEFAULT_COLOR = "#171717";
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export type ColorPickerContextValue = {
  value: string;
  resolvedValue: string;
  defaultValue: string;
  resolvedDefaultValue: string;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
  isValidHexColor: (value: string) => boolean;
};

export const isValidHexColor = (value: string) => HEX_COLOR_REGEX.test(value);

export function resolveThemePrimaryColor() {
  if (typeof window === "undefined") {
    return FALLBACK_DEFAULT_COLOR;
  }

  const primaryColorValue = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary")
    .trim();

  return resolveCssColorValue(primaryColorValue, FALLBACK_DEFAULT_COLOR);
}

export const DEFAULT_COLOR =
  typeof document === "undefined"
    ? FALLBACK_DEFAULT_COLOR
    : resolveThemePrimaryColor();

export const ColorPickerContext = createContext<ColorPickerContextValue | null>(
  null,
);

export const useColorPickerContext = () => {
  const context = useContext(ColorPickerContext);

  if (!context) {
    throw new Error("ColorPicker components must be used within ColorPicker");
  }

  return context;
};
