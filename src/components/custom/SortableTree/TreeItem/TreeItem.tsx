import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
} from "react";

import { cn } from "@/shared/utils/presentation";

import styles from "./TreeItem.module.css";

export interface TreeItemProps extends ComponentPropsWithoutRef<"div"> {
  clone?: boolean;
  ghost?: boolean;
  disableInteraction?: boolean;
}

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      clone = false,
      ghost = false,
      disableInteraction = false,
      className,
      style,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={cn(
        styles.TreeItem,
        clone && styles.clone,
        ghost && styles.ghost,
        disableInteraction && styles.disableInteraction,
        className,
      )}
      style={style as CSSProperties}
    />
  ),
);

TreeItem.displayName = "TreeItem";
