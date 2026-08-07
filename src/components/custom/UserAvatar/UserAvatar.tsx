import type { ComponentProps } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { initials } from "@/shared/utils/presentation";

export type UserAvatarProps = Omit<
  ComponentProps<typeof Avatar>,
  "children"
> & {
  name: string;
  image?: string | null;
  alt?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  image,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  return (
    <Avatar className={className} {...props}>
      {image ? (
        <AvatarImage
          className={imageClassName}
          src={image}
          alt={alt ?? name}
        />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
