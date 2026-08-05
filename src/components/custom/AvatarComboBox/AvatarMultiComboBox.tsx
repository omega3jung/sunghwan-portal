"use client";

import { Loader2 } from "lucide-react";
import type { ForwardedRef } from "react";
import { forwardRef, Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { NS } from "@/lib/application/i18n";
import { cn } from "@/shared/utils/presentation";

import { AvatarComboBoxOptionItem } from "./AvatarComboBoxOptionItem";
import { AvatarStack } from "./AvatarStack";
import type { AvatarMultiProps } from "./types";
import {
  createComboboxFilter,
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
  }: AvatarMultiProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const { t } = useTranslation(NS.component, {
    keyPrefix: "comboBox",
  });
  const { selectedOptions, unselectedOptions } = useMemo(
    () => splitOptionsBySelection(options, value),
    [options, value],
  );

  const orderedOptions = useMemo(
    () => [...selectedOptions, ...unselectedOptions],
    [selectedOptions, unselectedOptions],
  );
  const comboboxFilter = useMemo(() => createComboboxFilter(), []);

  const handleValueChange = (nextOptions: typeof options) => {
    const currentValueSet = new Set(value);
    const optionValueSet = new Set(options.map((option) => option.value));
    const nextValueSet = new Set(nextOptions.map((option) => option.value));

    for (const removedValue of value) {
      if (
        optionValueSet.has(removedValue) &&
        !nextValueSet.has(removedValue)
      ) {
        onRemove?.(removedValue);
      }
    }

    for (const addedValue of nextValueSet) {
      if (!currentValueSet.has(addedValue)) {
        onSelect?.(addedValue);
      }
    }
  };

  return (
    <div data-testid="avatarcombobox">
      <Combobox
        items={orderedOptions}
        value={selectedOptions}
        onValueChange={handleValueChange}
        filter={comboboxFilter}
        multiple
        disabled={disabled}
        readOnly={readOnly}
        modal={modal}
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
              disabled={disabled || readOnly}
            />
          }
          icon={
            isLoading ? (
              <Loader2 className="pointer-events-none size-6 animate-spin" />
            ) : readOnly ? null : undefined
          }
        >
          <AvatarStack
            selected={selectedOptions}
            placeholder={placeholder}
            placeholderClassName={placeholderClassName}
            badgeVariant={badgeVariant}
            size={size}
            maxImages={maxImages}
          />
        </ComboboxTrigger>

        <ComboboxContent>
          <ComboboxInput
            aria-label={placeholder ?? t("searchUsers")}
            placeholder={placeholder}
            showTrigger={false}
          />
          <ComboboxEmpty>{t("empty")}</ComboboxEmpty>
          <ComboboxList showScrollbar className="max-h-48 min-h-0">
            {(user) => {
              const unselectedIndex = unselectedOptions.indexOf(user);
              const isFirstUnselected =
                selectedOptions.length > 0 && unselectedIndex === 0;

              return (
                <Fragment key={user.value}>
                  {isFirstUnselected && <ComboboxSeparator />}
                  <AvatarComboBoxOptionItem
                    user={user}
                    badgeVariant={badgeVariant}
                    testId={
                      unselectedIndex >= 0
                        ? `unselected-list-item-${unselectedIndex}`
                        : undefined
                    }
                  />
                </Fragment>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export const AvatarMultiComboBox = forwardRef<
  HTMLButtonElement,
  AvatarMultiProps
>(Component);

AvatarMultiComboBox.displayName = "AvatarMultiComboBox";
