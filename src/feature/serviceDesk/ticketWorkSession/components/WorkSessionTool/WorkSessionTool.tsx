"use client";

import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TicketDetail } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";

import { WorkSessionToolContent } from "./WorkSessionToolContent";

export type WorkSessionToolProps = {
  children: ReactElement;
  ticket?: Pick<
    TicketDetail,
    "id" | "status" | "workMinutes" | "isCurrentWorker"
  > | null;
};

export function WorkSessionTool({ children, ticket }: WorkSessionToolProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const [open, setOpen] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const skipNextResetRef = useRef(false);

  const resetContent = () => {
    setContentKey((currentValue) => currentValue + 1);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      if (skipNextResetRef.current) {
        skipNextResetRef.current = false;
        return;
      }

      resetContent();
    }
  };

  const closeTool = () => {
    skipNextResetRef.current = true;
    setOpen(false);
    resetContent();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-primary-muted px-4 py-3">
          <h2 className="text-sm font-semibold text-primary">
            {t("workSessionTool.title")}
          </h2>
        </div>

        <WorkSessionToolContent
          key={contentKey}
          ticket={ticket}
          onClose={closeTool}
        />
      </PopoverContent>
    </Popover>
  );
}
