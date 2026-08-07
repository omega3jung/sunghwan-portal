"use client";

import { Loader2 } from "lucide-react";

export function ServiceDeskSettingsPageLoading() {
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
}
