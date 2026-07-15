"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { type TimelineOrder } from "@/components/custom/Timeline";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { TicketHistory } from "@/domain/serviceDesk";
import {
  TicketHistoryTimelineContent,
  TicketHistoryTimelineHeader,
} from "@/feature/serviceDesk/ticketHistory/client";
import { NS } from "@/lib/application/i18n";

type TicketHistorySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: TicketHistory[];
  isLoading?: boolean;
};

export function TicketHistorySheet({
  open,
  onOpenChange,
  items,
  isLoading = false,
}: TicketHistorySheetProps) {
  const [order, setOrder] = useState<TimelineOrder>("desc");
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Sheet modal={true} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        size="md"
        padding="none"
        className="gap-0 w-full sm:w-[380px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("historySheet.title")}</SheetTitle>
          <SheetDescription>{t("historySheet.description")}</SheetDescription>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-col bg-background">
          <div className="border-b border-primary-muted px-4 py-3">
            <TicketHistoryTimelineHeader />
          </div>
          <TicketHistoryTimelineContent
            items={items}
            isLoading={isLoading}
            order={order}
            onOrderChange={setOrder}
            className="h-full"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
