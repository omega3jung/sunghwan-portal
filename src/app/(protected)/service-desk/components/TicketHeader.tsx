"use client";

import {
  ChevronLeft,
  Clock3,
  PanelLeft,
  Pickaxe,
  SquarePen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { useRouteLoading } from "@/components/layout/RouteLoading";
import { Button } from "@/components/ui/button";
import type { MainCategory, TicketDetail } from "@/domain/serviceDesk";
import { UpdateTicketDialog } from "@/feature/serviceDesk/ticket/client";
import { WorkSessionTool } from "@/feature/serviceDesk/ticketWorkSession/client";
import type { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { cn } from "@/shared/utils/presentation";

type TicketHeaderProps = {
  ticket?: TicketDetail | null;
  categories: MainCategory[];
  users: ImageValueLabel[];
  language: SupportedLanguage;
  isDetailsAsideOpen: boolean;
  onToggleDetailsAside: Dispatch<SetStateAction<boolean>>;
  onOpenHistorySheet: Dispatch<SetStateAction<boolean>>;
};

export function TicketHeader({
  ticket,
  categories,
  users,
  language,
  isDetailsAsideOpen,
  onToggleDetailsAside,
  onOpenHistorySheet,
}: TicketHeaderProps) {
  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();

  const { t } = useTranslation(NS.serviceDesk);
  const canRequesterUpdateTicket =
    !!ticket &&
    ticket.owner &&
    ticket.active &&
    (ticket.status === "Approval" || ticket.status === "Assigned");

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 pb-2 pr-1 text-foreground sm:pr-4">
      <Button
        type="button"
        variant="ghost"
        className="max-w-full rounded-xl pl-1 pr-2"
        title={t("hoverMessage.backToList")}
        onClick={() => {
          const href = "/service-desk";
          startRouteLoadingForHref(href);
          router.push(href);
        }}
      >
        <ChevronLeft className="p-0" />
        {t("field.list", { ns: NS.common })}
      </Button>

      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        {ticket?.hasBeenWorker ? (
          <WorkSessionTool ticket={ticket}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 rounded-md xl:inline-flex"
              title={t("hoverMessage.workSessionTool")}
            >
              <Pickaxe
                className={cn("h-4 w-4 transition-transform text-amber-700")}
              />
            </Button>
          </WorkSessionTool>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 rounded-md xl:inline-flex"
          title={t("hoverMessage.openDetailAside")}
          onClick={() => {
            onToggleDetailsAside((previous) => !previous);
          }}
        >
          <PanelLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isDetailsAsideOpen && "rotate-180 text-primary",
            )}
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md"
          title={t("hoverMessage.openHistoryDrawer")}
          onClick={() => {
            onOpenHistorySheet(true);
          }}
        >
          <Clock3 className="h-4 w-4 text-cyan-700" />
        </Button>

        {ticket && canRequesterUpdateTicket ? (
          <UpdateTicketDialog
            ticketId={ticket.id}
            categories={categories}
            users={users}
            language={language}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                title={t("ticketUpdate.trigger")}
              >
                <SquarePen className="h-4 w-4 text-emerald-700" />
              </Button>
            }
          />
        ) : null}
      </div>
    </header>
  );
}
