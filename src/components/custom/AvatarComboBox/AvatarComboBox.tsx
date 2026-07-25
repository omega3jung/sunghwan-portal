"use client";

import { Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { cn, initials } from "@/shared/utils/presentation";

import { AvatarComboBoxOptionItem } from "./AvatarComboBoxOptionItem";
import type { AvatarSingleProps } from "./types";
import { createComboboxFilter, EMPTY_OPTION_TEXT } from "./utils";
import { badgeVariants, comboBoxVariants } from "./variants";

const Component = (
  {
    placeholder,
    placeholderClassName,
    options = [],
    value = null,
    onChange,
    variant,
    badgeVariant,
    size,
    isLoading = false,
    disabled = false,
    readOnly = false,
    clearable = false,
    className,
    modal = true,
    ...buttonProps
  }: AvatarSingleProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );
  const comboboxFilter = useMemo(() => createComboboxFilter(), []);

  const isBlocked = disabled || readOnly;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isBlocked) {
      setOpen(false);
      return;
    }

    setOpen(nextOpen);
  };

  const handleValueChange = (selection: (typeof options)[number] | null) => {
    if (isBlocked) {
      return;
    }

    if (clearable && selection?.value === value) {
      onChange?.(null);
      setOpen(false);
      return;
    }

    onChange?.(selection?.value ?? null);
    setOpen(false);
  };

  return (
    <div data-testid="avatarcombobox">
      <Combobox
        items={options}
        value={selectedOption}
        onValueChange={handleValueChange}
        filter={comboboxFilter}
        disabled={disabled}
        readOnly={readOnly}
        modal={modal}
        open={open}
        onOpenChange={handleOpenChange}
      >
        <ComboboxTrigger
          render={
            <Button
              {...buttonProps}
              ref={ref}
              variant="outline"
              className={cn(
                comboBoxVariants({ variant, size }),
                "py-0.5",
                className,
              )}
              disabled={isBlocked}
            />
          }
          icon={
            isLoading ? (
              <Loader2 className="pointer-events-none size-6 animate-spin" />
            ) : readOnly ? null : undefined
          }
        >
          {selectedOption ? (
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={selectedOption.image}
                  alt={selectedOption.label}
                />
                <AvatarFallback
                  className={cn(
                    badgeVariants({ badgeVariant }),
                    "font-normal",
                  )}
                >
                  {initials(selectedOption.label)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <h4 className="truncate text-xs">{selectedOption.label}</h4>
                <h4 className="truncate text-xs">
                  {selectedOption.displayName || selectedOption.value}
                </h4>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "px-2 font-normal text-muted-foreground",
                placeholderClassName,
              )}
            >
              {placeholder}
            </div>
          )}
        </ComboboxTrigger>

        <ComboboxContent>
          <ComboboxInput
            aria-label={placeholder ?? "Search users"}
            placeholder={placeholder}
            showTrigger={false}
          />
          <ComboboxEmpty>{EMPTY_OPTION_TEXT}</ComboboxEmpty>
          <ComboboxList className="max-h-48 min-h-0">
            {(option) => (
              <AvatarComboBoxOptionItem
                key={`option-${option.value}`}
                user={option}
                badgeVariant={badgeVariant}
                testId={`option-list-item-${options.indexOf(option)}`}
              />
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export const AvatarComboBox = forwardRef<HTMLButtonElement, AvatarSingleProps>(
  Component,
);

AvatarComboBox.displayName = "AvatarComboBox";
