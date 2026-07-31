import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ImageValueLabel } from "@/shared/types/options";
import { cn, initials } from "@/shared/utils/presentation";

import type { BadgeVariant, ComboBoxSize } from "./types";
import { badgeVariants, comboBoxAvatarVariants } from "./variants";

type AvatarStackProps = {
  selected: ImageValueLabel[];
  placeholder?: string;
  placeholderClassName?: string;
  badgeVariant?: BadgeVariant;
  size?: ComboBoxSize;
  maxImages: number;
};

export function AvatarStack({
  selected,
  placeholder,
  placeholderClassName,
  badgeVariant,
  size,
  maxImages,
}: AvatarStackProps) {
  if (!selected.length) {
    return (
      <div
        className={cn(
          "px-2 font-normal text-muted-foreground",
          placeholderClassName,
        )}
      >
        {placeholder}
      </div>
    );
  }

  const visibleSelected = selected.slice(0, maxImages);
  const remainingCount = Math.max(selected.length - maxImages, 0);

  return (
    <div className="flex h-full items-center -space-x-3">
      {visibleSelected.map((item, index) => (
        <div
          data-testid={`parentdiv${index}`}
          key={item.value}
          className={comboBoxAvatarVariants({ size })}
        >
          <Avatar
            className="size-full bg-background ring-2 ring-background"
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
        <div
          data-testid={`parentdiv${visibleSelected.length}`}
          className={comboBoxAvatarVariants({ size })}
        >
          <Avatar
            className="size-full bg-foreground"
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
