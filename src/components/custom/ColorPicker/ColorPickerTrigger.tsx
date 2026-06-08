"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/presentation";

import { useColorPickerContext } from "./ColorPickerContext";

export type ColorPickerTriggerProps = {
  className?: string;
  "aria-label"?: string;
};

export const ColorPickerTrigger = ({
  className,
  "aria-label": ariaLabel = "Select color",
}: ColorPickerTriggerProps) => {
  const { resolvedValue, disabled, onChange } = useColorPickerContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;

    if (!input || disabled) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };

  return (
    <div className="flex justify-center relative shrink-0">
      <input
        ref={inputRef}
        type="color"
        aria-label={ariaLabel}
        value={resolvedValue}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        tabIndex={-1}
        className="pointer-events-none absolute h-full w-full opacity-0"
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={ariaLabel}
        onClick={openPicker}
        disabled={disabled}
        className={cn("h-9 w-9 border-none", className)}
      >
        <span
          aria-hidden="true"
          className="h-full w-full rounded-lg shadow-inner"
          style={{ backgroundColor: resolvedValue }}
        />
      </Button>
    </div>
  );
};
