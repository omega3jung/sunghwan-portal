import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandItem } from "@/components/ui/command";
import type { ImageValueLabel } from "@/shared/types/options";
import { cn, initials } from "@/shared/utils/presentation";

import type { BadgeVariant } from "./types";
import { badgeVariants } from "./variants";

type AvatarMultiComboBoxOptionItemProps = {
  user: ImageValueLabel;
  badgeVariant?: BadgeVariant;
  onSelect: (value: string) => void;
  testId?: string;
  className?: string;
};

export function AvatarMultiComboBoxOptionItem({
  user,
  badgeVariant,
  onSelect,
  testId,
  className,
}: AvatarMultiComboBoxOptionItemProps) {
  return (
    <CommandItem
      className={cn("flex items-center", className)}
      value={user.value}
      data-testid={testId}
      onSelect={() => onSelect(user.value)}
    >
      <Avatar className="mx-1 h-8 w-8">
        <AvatarImage src={user.image} alt={user.label} />
        <AvatarFallback
          className={cn(badgeVariants({ badgeVariant }), "font-normal")}
        >
          {initials(user.label)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h4 className="text-xs">{user.label}</h4>
        <h4 className="text-xs">{user.displayName || user.value}</h4>
      </div>
    </CommandItem>
  );
}
