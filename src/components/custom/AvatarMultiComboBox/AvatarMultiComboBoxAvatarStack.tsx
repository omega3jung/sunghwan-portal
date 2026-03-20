import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ImageValueLabel } from "@/shared/types/options";
import { cn, initials } from "@/shared/utils";

import type { BadgeVariant } from "./types";
import { badgeVariants } from "./variants";

type AvatarMultiComboBoxAvatarStackProps = {
  selected: ImageValueLabel[];
  placeholder?: string;
  placeholderClassName?: string;
  badgeVariant?: BadgeVariant;
  maxImages: number;
};

export function AvatarMultiComboBoxAvatarStack({
  selected,
  placeholder,
  placeholderClassName,
  badgeVariant,
  maxImages,
}: AvatarMultiComboBoxAvatarStackProps) {
  if (!selected.length) {
    return <div className={placeholderClassName}>{placeholder}</div>;
  }

  const visibleSelected = selected.slice(0, maxImages);
  const remainingCount = Math.max(selected.length - maxImages, 0);

  return (
    <div className="flex items-center -space-x-3">
      {visibleSelected.map((item, index) => (
        <div data-testid={`parentdiv${index}`} key={item.value}>
          <Avatar
            className="h-8 w-8 ring-2 ring-background"
            style={{ zIndex: selected.length - index }}
          >
            <AvatarImage src={item.image} alt={item.label} />
            <AvatarFallback
              className={cn(badgeVariants({ badgeVariant }), "font-normal")}
            >
              {initials(item.label)}
            </AvatarFallback>
          </Avatar>
        </div>
      ))}
      {remainingCount > 0 && (
        <div data-testid={`parentdiv${visibleSelected.length}`}>
          <Avatar
            className="h-8 w-8 ring-2 ring-foreground"
            style={{ zIndex: selected.length - visibleSelected.length }}
          >
            <AvatarFallback
              className={cn(badgeVariants({ badgeVariant }), "font-normal")}
            >
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
