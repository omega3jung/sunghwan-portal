import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ComboboxItem } from "@/components/ui/combobox";
import type { ImageValueLabel } from "@/shared/types/options";
import { cn, initials } from "@/shared/utils/presentation";

import type { BadgeVariant } from "./types";
import { badgeVariants } from "./variants";

type AvatarComboBoxOptionItemProps = {
  user: ImageValueLabel;
  badgeVariant?: BadgeVariant;
  testId?: string;
  className?: string;
};

export function AvatarComboBoxOptionItem({
  user,
  badgeVariant,
  testId,
  className,
}: AvatarComboBoxOptionItemProps) {
  return (
    <ComboboxItem
      className={cn("flex items-center", className)}
      value={user}
      data-testid={testId}
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
    </ComboboxItem>
  );
}
