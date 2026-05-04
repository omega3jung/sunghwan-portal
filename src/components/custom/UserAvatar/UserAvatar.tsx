import { useMemo } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageValueLabel } from "@/shared/types/options";
import { cn, initials } from "@/shared/utils/presentation";

export const UserAvatar = ({
  item,
  className,
}: {
  item: ImageValueLabel;
  className?: string;
}) => {
  const nameInitials = useMemo(() => {
    return initials(item.label);
  }, [item.label]);

  if (item.image) {
    return (
      <div
        className={cn("h-8 w-8 rounded-full bg-cover bg-center", className)}
        style={{ backgroundImage: `url(${item.image})` }}
      ></div>
    );
  }

  return (
    <Avatar className={cn("h-8 w-8", className)}>
      <AvatarFallback className="bg-gray-800 text-white">
        {nameInitials}
      </AvatarFallback>
    </Avatar>
  );
};
