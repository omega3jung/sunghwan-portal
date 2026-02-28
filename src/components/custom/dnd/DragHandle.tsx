// DragHandle.tsx
import { GripVertical } from "lucide-react";
import React from "react";

import { cn } from "@/utils";

export function DragHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        "text-primary hover:text-foreground",
        props.className,
      )}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}
