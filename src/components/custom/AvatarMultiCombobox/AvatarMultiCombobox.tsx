"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import React, { useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { initials } from "@/utils";
import { comboBoxVariants } from "./variants";
import { AvatarMultiComboBoxProps, Props } from "./types";
import { ImageValueLabel } from "@/types";
import { UserAvatar } from "../UserAvatar";

const Component = (props: AvatarMultiComboBoxProps & Props, _: any) => {
  const {
    placeholder,
    options = [],
    value = [],
    onSelect,
    onRemove,
    variant,
    size,
    isLoading = false,
    disabled = false,
    readOnly = false,
    maxImages = 99,
  } = props;

  {
    /* use defined button ref */
  }
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // to display selected items on top.
  const selected = useMemo<Array<ImageValueLabel>>(() => {
    const currentSelected = options.filter((option) =>
      value?.includes(option.value)
    );

    return currentSelected.sort(
      (a, b) => value.indexOf(a.value) - value.indexOf(b.value)
    );
  }, [options, value]);

  // to display selected items on top.
  const notSelected = useMemo<Array<ImageValueLabel>>(() => {
    return options.filter((option) => !value?.includes(option.value));
  }, [options, value]);

  // do something when select an item.
  const handleSelect = (selection: string) => {
    onSelect?.(selection);
  };

  // do something when select a selected item.
  const handleRemove = (selection: string) => {
    onRemove?.(selection);
  };

  return (
    <div data-testid="avatarcombobox">
      <Popover>
        <PopoverTrigger asChild className="flex items-start">
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="outline"
              role="combobox"
              className={cn(comboBoxVariants({ variant, size }))}
              disabled={disabled || readOnly}
            >
              {!selected.length ? (
                <div>{placeholder}</div>
              ) : (
                <div className="flex items-center -space-x-3">
                  {[...selected].splice(0, maxImages + 1).map((item, index) => {
                    return (
                      <div
                        data-testid={"parentdiv" + index}
                        key={"parentdiv" + index}
                      >
                        {index < maxImages && (
                          <Avatar
                            key={`space-${item.value}`}
                            className={cn(
                              "h-8 w-8 ring-2 ring-foreground",
                              `z-[${selected.length - index}]`
                            )}
                          >
                            {/* value.includes(item.value) */}
                            <AvatarImage src={item.image} alt={item.label} />
                            <AvatarFallback className="bg-gray-800 text-white">
                              {initials(item.label)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {index == maxImages && (
                          <Avatar
                            key={`space-${item.value}`}
                            className={cn(
                              "h-8 w-8 ring-2 ring-foreground",
                              `z-[${selected.length - index}]`
                            )}
                          >
                            <AvatarFallback
                              key={"extrausers"}
                              className="bg-gray-800 pl-2 text-white"
                            >
                              {"+"}
                              {selected.length - maxImages}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}

                  {!value.length && <div>{placeholder}</div>}
                </div>
              )}

              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : !readOnly ? (
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-basic" />
              ) : (
                ""
              )}
            </Button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-full translate-y-0 p-0"
          style={{ width: "300px" }}
        >
          <Command
            filter={(value, search) => {
              if (!options) {
                return 0;
              }

              const ocurrences: string[] = [];

              for (let i = 0; i < options.length; i++) {
                if (
                  options[i].label.toUpperCase().includes(search.toUpperCase())
                ) {
                  ocurrences.push(options[i].value);
                } else if (
                  options[i].value.toUpperCase() === search.toUpperCase()
                ) {
                  ocurrences.push(options[i].value);
                }
              }

              if (ocurrences.length == 0) {
                return 0;
              }

              const found = ocurrences.find((e) =>
                value.toUpperCase().includes(e.toUpperCase())
              );

              if (found) {
                return 1;
              } else {
                return 0;
              }
            }}
          >
            <CommandInput placeholder={placeholder} />
            <CommandList className="max-h-48 min-h-0">
              {/* when empty) */}
              <CommandEmpty>No option found.</CommandEmpty>

              {/* selectd item on top */}
              {selected.length > 0 && (
                <CommandGroup>
                  {selected.map((user) => (
                    <CommandItem
                      className="flex items-center"
                      value={user.value}
                      key={`option-${user.value}`}
                      onSelect={() =>
                        value?.includes(user.value)
                          ? handleRemove(user.value)
                          : handleSelect(user.value)
                      }
                    >
                      <Avatar className="mx-1 h-8 w-8 ring-2 ring-primary">
                        <AvatarImage src={user.image} alt={user.label} />
                        <AvatarFallback className="bg-gray-800 text-white">
                          {initials(user.label)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xs">{user.label}</h4>
                        <h4 className="text-xs">{user.value}</h4>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {!readOnly && (
                <>
                  <Separator></Separator>

                  {/* not selectd item on top */}
                  <CommandGroup data-testid={`unselected-list`}>
                    {notSelected.map((user, index) => (
                      <CommandItem
                        className="flex items-center"
                        value={user.value}
                        key={`option-${user.value}`}
                        data-testid={`unselected-list-item-${index}`}
                        onSelect={() =>
                          value?.includes(user.value)
                            ? handleRemove(user.value)
                            : handleSelect(user.value)
                        }
                      >
                        <UserAvatar item={user} className="mx-1" />
                        <div>
                          <h4 className="text-xs">{user.label}</h4>
                          <h4 className="text-xs">{user.value}</h4>
                        </div>
                      </CommandItem>
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

export const AvatarMultiComboBox = React.forwardRef<any, Props>(Component);
