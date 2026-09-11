import { ChevronRight } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/presentation";

type ServiceDeskSettingsTreeRowProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  label: ReactNode;
  actions?: ReactNode;
  hasChildren: boolean;
  collapsed?: boolean;
  selected?: boolean;
  overlay?: boolean;
  child?: boolean;
  onCollapse?: () => void;
  collapseLabel?: string;
};

const ROW_LAYOUT_STYLE =
  "relative -mb-px flex w-full min-w-0 items-center justify-between pr-5 pl-3";
const ROW_APPEARANCE_STYLE =
  "border border-border bg-background text-foreground";
const ROW_INTERACTION_STYLE =
  "transition-[background-color,border-color,box-shadow] hover:bg-muted/50";
const SELECTED_STATE_STYLE =
  "data-[selected=true]:z-10 data-[selected=true]:border-l-[3px] data-[selected=true]:border-l-primary data-[selected=true]:bg-primary/5";
const OVERLAY_STATE_STYLE =
  "data-[overlay=true]:mb-0 data-[overlay=true]:rounded-md data-[overlay=true]:shadow-lg";
const ROW_SIZE_STYLE = {
  parent: "h-10 text-base",
  child: "h-9 text-sm",
} as const;

export function ServiceDeskSettingsTreeRow({
  label,
  actions,
  hasChildren,
  collapsed = false,
  selected = false,
  overlay = false,
  child = false,
  onCollapse,
  collapseLabel,
  className,
  ...props
}: ServiceDeskSettingsTreeRowProps) {
  return (
    <div
      {...props}
      data-overlay={overlay}
      data-selected={selected && !overlay}
      className={cn(
        ROW_LAYOUT_STYLE,
        ROW_APPEARANCE_STYLE,
        ROW_INTERACTION_STYLE,
        SELECTED_STATE_STYLE,
        OVERLAY_STATE_STYLE,
        child ? ROW_SIZE_STYLE.child : ROW_SIZE_STYLE.parent,
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="size-4 rounded-sm"
            aria-label={collapseLabel}
            onClick={(event) => {
              event.stopPropagation();
              onCollapse?.();
            }}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform",
                !collapsed && "rotate-90",
              )}
            />
          </Button>
        ) : (
          <span className="size-4 shrink-0" aria-hidden="true" />
        )}

        <span className="truncate">{label}</span>
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
