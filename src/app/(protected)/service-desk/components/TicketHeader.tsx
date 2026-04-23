import { ChevronLeft, Clock3, PanelLeft, Pickaxe } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import type { TicketDetail } from "@/domain/serviceDesk";
import { TrackTimeTool } from "@/feature/serviceDesk/ticket/trackTime/components";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";

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

  const { t } = useTranslation(NS.serviceDesk);

  return (
    <header className="flex items-center justify-between pb-2 pr-4 text-foreground">
      <Button
        type="button"
        variant="ghost"
        className="rounded-xl pl-1"
        title={t("hoverMessage.backToList")}
        onClick={() => {
          router.push("/service-desk/");
        }}
      >
        <ChevronLeft className="p-0" />
        {t("field.list", { ns: NS.common })}
      </Button>

      <div className="flex items-center gap-2">
        <TrackTimeTool ticket={ticket}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 rounded-md xl:inline-flex"
            title={t("hoverMessage.trackTimeTool")}
            disabled={!ticket}
          >
            <Pickaxe className={cn("h-4 w-4 transition-transform")} />
          </Button>
        </TrackTimeTool>
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
