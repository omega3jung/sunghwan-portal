"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo } from "react";

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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils/presentation";

import { AvatarMultiComboBoxAvatarStack } from "./AvatarMultiComboBoxAvatarStack";
import { AvatarMultiComboBoxOptionItem } from "./AvatarMultiComboBoxOptionItem";
import type { Props } from "./types";
import {
  createCommandFilter,
  EMPTY_OPTION_TEXT,
  splitOptionsBySelection,
} from "./utils";
import { comboBoxVariants } from "./variants";

const Component = (
  {
    placeholder,
    placeholderClassName,
    options = [],
    value = [],
    onSelect,
    onRemove,
    variant,
    badgeVariant,
    size,
    isLoading = false,
    disabled = false,
    readOnly = false,
    maxImages = 99,
    className,
    modal = true,
    ...buttonProps
  }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { selectedOptions, unselectedOptions } = useMemo(
    () => splitOptionsBySelection(options, value),
    [options, value],
  );

  const commandFilter = useMemo(() => createCommandFilter(options), [options]);

  const handleToggleOption = (selection: string) => {
    if (value.includes(selection)) {
      onRemove?.(selection);
      return;
    }

    onSelect?.(selection);
  };

  return (
    <div data-testid="avatarcombobox">
      <Popover modal={modal}>
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
            disabled={disabled || readOnly}
          >
            <AvatarMultiComboBoxAvatarStack
              selected={selectedOptions}
              placeholder={placeholder}
              placeholderClassName={placeholderClassName}
              badgeVariant={badgeVariant}
              maxImages={maxImages}
            />
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

              {selectedOptions.length > 0 && (
                <CommandGroup>
                  {selectedOptions.map((user) => (
                    <AvatarMultiComboBoxOptionItem
                      key={`selected-${user.value}`}
                      user={user}
                      badgeVariant={badgeVariant}
                      onSelect={handleToggleOption}
                    />
                  ))}
                </CommandGroup>
              )}

              {!readOnly && (
                <>
                  {selectedOptions.length > 0 && <Separator />}
                  <CommandGroup data-testid="unselected-list">
                    {unselectedOptions.map((user, index) => (
                      <AvatarMultiComboBoxOptionItem
                        key={`unselected-${user.value}`}
                        user={user}
                        badgeVariant={badgeVariant}
                        onSelect={handleToggleOption}
                        testId={`unselected-list-item-${index}`}
                      />
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const AvatarMultiComboBox = forwardRef<HTMLButtonElement, Props>(
  Component,
);

AvatarMultiComboBox.displayName = "AvatarMultiComboBox";
