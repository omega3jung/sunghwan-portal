import { GripVertical } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/utils/presentation";

export function SortableTreeDragHandle({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        "inline-flex size-5 shrink-0 touch-none items-center justify-center border-0 bg-transparent p-0",
        "cursor-grab text-primary active:cursor-grabbing hover:text-foreground",
        "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      <GripVertical className="size-4" />
    </button>
  );
}
