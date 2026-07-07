"use client";

import { Loader2 } from "lucide-react";

import { cn } from "@/shared/utils/presentation";

export function ServiceDeskSettingsLoading({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("flex h-40 w-full items-center justify-center", className)}
    >
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
}
