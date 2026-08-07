import { UserAvatar } from "@/components/custom/UserAvatar";
import { ComboboxItem } from "@/components/ui/combobox";
import type { ImageValueLabel } from "@/shared/types/options";
import { cn } from "@/shared/utils/presentation";

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
      className={className}
      value={user}
      data-testid={testId}
    >
      <UserAvatar
        className="mx-1"
        fallbackClassName={cn(
          badgeVariants({ badgeVariant }),
          "font-normal",
        )}
        image={user.image}
        name={user.label}
      />
      <div>
        <h4 className="text-xs">{user.label}</h4>
        <h4 className="text-xs">{user.displayName || user.value}</h4>
      </div>
    </ComboboxItem>
  );
}
