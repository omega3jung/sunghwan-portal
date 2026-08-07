"use client";

import { Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/custom/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { AvatarComboBoxOptionItem } from "./AvatarComboBoxOptionItem";
import type { AvatarSingleProps } from "./types";
import { createComboboxFilter } from "./utils";
import {
  badgeVariants,
  comboBoxAvatarVariants,
  comboBoxVariants,
} from "./variants";

/**
 * Controlled single-user selector whose external value is an option key.
 * Reselecting the active option clears it only when `clearable` is enabled;
 * read-only mode blocks both opening and value changes.
 */
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
  const { t } = useTranslation(NS.component, {
    keyPrefix: "comboBox",
  });
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
            <div className="flex h-full min-w-0 items-center gap-2">
              <div className={comboBoxAvatarVariants({ size })}>
                <UserAvatar
                  className="size-full"
                  fallbackClassName={cn(
                    badgeVariants({ badgeVariant }),
                    "font-normal",
                  )}
                  image={selectedOption.image}
                  name={selectedOption.label}
                />
              </div>
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
            aria-label={placeholder ?? t("searchUsers")}
            placeholder={placeholder}
            showTrigger={false}
          />
          <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
          <ComboboxList showScrollbar className="max-h-48 min-h-0">
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
