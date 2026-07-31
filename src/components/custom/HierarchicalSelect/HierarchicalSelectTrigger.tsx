import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/shared/utils/presentation";

type HierarchicalSelectTriggerProps = {
  id?: string;
  open: boolean;
  disabled: boolean;
  hasValue: boolean;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export const HierarchicalSelectTrigger = ({
  id,
  open,
  disabled,
  hasValue,
  children,
  icon = <ChevronDown className="opacity-50" />,
  className,
}: HierarchicalSelectTriggerProps) => (
  <PopoverTrigger
    render={
      <Button
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between border-input bg-transparent px-3 font-normal",
          !hasValue && "text-muted-foreground",
          className,
        )}
      />
    }
  >
    {children}
    {icon}
  </PopoverTrigger>
);
