"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, initials } from "@/shared/utils/presentation";

import { AvatarComboBoxOptionItem } from "./AvatarComboBoxOptionItem";
import type { AvatarSingleProps } from "./types";
import { createCommandFilter, EMPTY_OPTION_TEXT } from "./utils";
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
  const commandFilter = useMemo(() => createCommandFilter(options), [options]);

  const isBlocked = disabled || readOnly;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isBlocked) {
      setOpen(false);
      return;
    }

    setOpen(nextOpen);
  };

  const handleSelect = (selection: string) => {
    if (isBlocked) {
      return;
    }

    if (selection === value) {
      if (clearable) {
        onChange?.(null);
      }

      setOpen(false);
      return;
    }

    onChange?.(selection);
    setOpen(false);
  };

  return (
    <div data-testid="avatarcombobox">
      <Popover modal={modal} open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            {...buttonProps}
            ref={ref}
            variant="outline"
            role="combobox"
            className={cn(
              comboBoxVariants({ variant, size }),
              "py-0.5",
              className,
            )}
            disabled={isBlocked}
          >
            {selectedOption ? (
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="h-8 w-8 shrink-0">
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

            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : !readOnly ? (
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-basic" />
            ) : null}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command filter={commandFilter}>
            <CommandInput placeholder={placeholder} />
            <CommandList className="max-h-48 min-h-0">
              <CommandEmpty>{EMPTY_OPTION_TEXT}</CommandEmpty>
              <CommandGroup data-testid="option-list">
                {options.map((option, index) => (
                  <AvatarComboBoxOptionItem
                    key={`option-${option.value}`}
                    user={option}
                    badgeVariant={badgeVariant}
                    onSelect={handleSelect}
                    testId={`option-list-item-${index}`}
                    showCheck={selectedOption?.value === option.value}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const AvatarComboBox = forwardRef<HTMLButtonElement, AvatarSingleProps>(
  Component,
);

AvatarComboBox.displayName = "AvatarComboBox";
