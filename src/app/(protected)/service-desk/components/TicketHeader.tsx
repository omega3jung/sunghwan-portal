import { ChevronLeft, Clock3, PanelLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";

type TicketHeaderProps = {
  isDetailsAsideOpen: boolean;
  onToggleDetailsAside: Dispatch<SetStateAction<boolean>>;
  onOpenHistorySheet: Dispatch<SetStateAction<boolean>>;
};

export function TicketHeader({
  isDetailsAsideOpen,
  onToggleDetailsAside,
  onOpenHistorySheet,
}: TicketHeaderProps) {
  const router = useRouter();

  const { t } = useTranslation(NS.serviceDesk);
  const { t: tMessage } = useTranslation(NS.message);

  return (
    <header className="flex items-center justify-between pb-2 pr-4 text-foreground">
      <Button
        type="button"
        variant="ghost"
        className="rounded-xl pl-1"
        title={tMessage("common.backToList")}
        onClick={() => {
          router.push("/service-desk/");
        }}
      >
        <ChevronLeft className="p-0" />
        {t("field.list")}
      </Button>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 rounded-md xl:inline-flex"
          title={tMessage("common.openDetailAside")}
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
          title={tMessage("common.openHistoryDrawer")}
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
