"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import React, { useRef, useState } from "react";

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

import { ComboBoxProps, Props } from "./type";
import { comboBoxVariants } from "./variants";

const Component = (props: ComboBoxProps & Props, _: any) => {
  const {
    placeholder,
    options = [],
    value: valueProp,
    onChange: onValueChange,
    defaultValue = "",
    clearOnRepick = true,
    variant,
    className,
    isLoading = false,
    disabled = false,
    readOnly = false,
    hideCheck = false,
  } = props;

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [value, setValue] = useControllableState<string>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  const current = options.find((item) => item.value === value);

  const handleSelect = (selection: string) => {
    const change = clearOnRepick && selection === value ? "" : selection;

    setValue(change);
    setOpen(false);
  };

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }

    if (!readOnly) {
      return <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-basic" />;
    }

    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          className={cn(comboBoxVariants({ variant, className }))}
          disabled={disabled || readOnly}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {variant === "icon" && <div>{props.icon}</div>}
            <div>{current?.label ?? placeholder}</div>
          </div>

          {getIcon()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={-(buttonRef.current?.offsetHeight ?? 0)}
        className="translate-y-0 p-0"
        style={{
          width: buttonRef.current?.offsetWidth,
        }}
      >
        <Command
          filter={(value, search) => {
            if (value.toUpperCase().includes(search.toUpperCase())) {
              return 1;
            }

            return 0;
          }}
        >
          <CommandInput placeholder={placeholder} />
          <CommandList className="max-h-48 min-h-0">
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  value={item.label}
                  key={item.value}
                  onSelect={() => handleSelect(item.value)}
                >
                  {!hideCheck && (
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  )}
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

export const ComboBox = React.forwardRef<any, Props>(Component);
