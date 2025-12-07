"use client";

import { Check, ChevronDown, Loader2, X } from "lucide-react";
import React, { Fragment, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { MultiComboboxProps, ComboBoxProps } from "./types";
import { comboBoxVariants } from "./variants";
import { badgeColors } from "./styles";

const Component = (props: MultiComboboxProps & ComboBoxProps, _: any) => {
  const {
    placeholder,
    options = [],
    value = [],
    onSelect,
    onRemove,
    variant,
    size,
    buttonVariant = "default",
    rainbowStart = 1,
    rainbowPick = undefined,
    isLoading = false,
    disabled = false,
    readOnly = false,
  } = props;

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleSelect = (selection: string) => {
    onSelect?.(selection);
  };

  const handleRemove = (selection: string) => {
    onRemove?.(selection);
  };

  return (
    <Popover>
      <PopoverTrigger asChild className="flex items-start">
        <div className="relative">
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            type="button"
            className={cn(comboBoxVariants({ variant, size }))}
            disabled={disabled || readOnly}
          >
            {!value.length ? (
              <div>{placeholder}</div>
            ) : (
              <div className="flex flex-wrap items-center gap-1">
                {options.map((item, index) => {
                  if (value.indexOf(item.value) < 0) {
                    return <Fragment key={`space-${item.value}`} />;
                  }

                  return (
                    <Badge
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.value);
                      }}
                      key={`space-${item.value}`}
                      variant={
                        buttonVariant === "rainbow" ? null : buttonVariant
                      }
                      className={cn(
                        "flex h-6 cursor-pointer gap-2 text-nowrap rounded-lg pr-1",
                        buttonVariant !== "rainbow"
                          ? null
                          : badgeColors[
                              !rainbowPick
                                ? (rainbowStart + index) % 10
                                : rainbowPick
                            ]
                      )}
                    >
                      {item.label}
                      <X size="16" />
                    </Badge>
                  );
                })}

                {!value.length && <div>{placeholder}</div>}
              </div>
            )}

            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : !readOnly ? (
              <ChevronDown className="ml-2 mr-2 h-4 w-4 shrink-0 text-basic" />
            ) : (
              ""
            )}
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="translate-y-0 p-0"
        style={{ width: buttonRef.current?.offsetWidth }}
      >
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-48 min-h-0">
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  value={item.label}
                  key={`option-${item.value}`}
                  onSelect={() => handleSelect(item.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(item.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const MultiComboBox = React.forwardRef<any, ComboBoxProps>(Component);
