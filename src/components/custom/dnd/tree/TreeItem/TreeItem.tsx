// TreeItem.tsx
import React, { forwardRef, HTMLAttributes } from "react";

import { cn } from "@/shared/utils";

import styles from "./TreeItem.module.css";

export interface TreeItemProps extends Omit<
  HTMLAttributes<HTMLLIElement>,
  "id"
> {
  depth: number;
  indentationWidth: number;

  clone?: boolean;
  ghost?: boolean;
  indicator?: boolean;

  disableInteraction?: boolean;
  disableSelection?: boolean;

  wrapperRef?(node: HTMLLIElement | null): void;

  children: React.ReactNode;
}

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      depth,
      indentationWidth,
      clone,
      ghost,
      indicator,
      disableInteraction,
      disableSelection,
      wrapperRef,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <li
        ref={wrapperRef}
        className={cn(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction,
        )}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div ref={ref} className={styles.TreeItem} style={style}>
          {children}
        </div>
      </li>
    );
  },
);

TreeItem.displayName = "TreeItem";
