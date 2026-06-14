import { ChevronLeft, Clock3, PanelLeft, Pickaxe } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { useRouteLoading } from "@/components/layout/RouteLoading";
import { Button } from "@/components/ui/button";
import type { TicketDetail } from "@/domain/serviceDesk";
import { WorkSessionTool } from "@/feature/serviceDesk/ticketWorkSession";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils/presentation";

type TicketHeaderProps = {
  ticket?: TicketDetail | null;
  isDetailsAsideOpen: boolean;
  onToggleDetailsAside: Dispatch<SetStateAction<boolean>>;
  onOpenHistorySheet: Dispatch<SetStateAction<boolean>>;
};

export function TicketHeader({
  ticket,
  isDetailsAsideOpen,
  onToggleDetailsAside,
  onOpenHistorySheet,
}: TicketHeaderProps) {
  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();

  const { t } = useTranslation(NS.serviceDesk);

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
        <WorkSessionTool ticket={ticket}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 rounded-md xl:inline-flex"
            title={t("hoverMessage.workSessionTool")}
            disabled={!ticket}
          >
            <Pickaxe className={cn("h-4 w-4 transition-transform")} />
          </Button>
        </WorkSessionTool>
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
          <Clock3 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
