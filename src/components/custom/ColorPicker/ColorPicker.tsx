"use client";

import React, { useEffect, useMemo, useState } from "react";

import { cn } from "@/shared/utils/presentation";

import {
  ColorPickerContext,
  isValidHexColor,
  resolveThemePrimaryColor,
} from "./ColorPickerContext";
import { ColorPickerHexInput } from "./ColorPickerHexInput";
import { ColorPickerReset } from "./ColorPickerReset";
import { ColorPickerTrigger } from "./ColorPickerTrigger";

export type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
};

const Root = ({
  value,
  onChange,
  defaultValue,
  disabled = false,
  placeholder,
  className,
  children,
}: ColorPickerProps) => {
  const [themeDefaultColor, setThemeDefaultColor] = useState(() =>
    resolveThemePrimaryColor(),
  );
  const resolvedDefaultValue = useMemo(() => {
    return defaultValue && isValidHexColor(defaultValue)
      ? defaultValue
      : themeDefaultColor;
  }, [defaultValue, themeDefaultColor]);
  const resolvedPlaceholder = useMemo(() => {
    return placeholder && isValidHexColor(placeholder)
      ? placeholder
      : resolvedDefaultValue;
  }, [placeholder, resolvedDefaultValue]);
  const resolvedValue = isValidHexColor(value) ? value : resolvedDefaultValue;

  useEffect(() => {
    const updateThemeDefaultColor = () => {
      setThemeDefaultColor(resolveThemePrimaryColor());
    };

    updateThemeDefaultColor();

    const observer = new MutationObserver(updateThemeDefaultColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ColorPickerContext.Provider
      value={{
        value,
        resolvedValue,
        defaultValue: defaultValue ?? resolvedDefaultValue,
        resolvedDefaultValue,
        placeholder: resolvedPlaceholder,
        disabled,
        onChange,
        isValidHexColor,
      }}
    >
      <div
        className={cn(
          "flex flex-wrap justify-center items-center gap-3",
          className,
        )}
      >
        {children ?? (
          <>
            <ColorPickerTrigger />
            <ColorPickerHexInput />
            <ColorPickerReset />
          </>
        )}
      </div>
    </ColorPickerContext.Provider>
  );
};

export const ColorPicker = Object.assign(Root, {});
