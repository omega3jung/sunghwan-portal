import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NS } from "@/lib/i18n";

type TicketActionEmptyProps = {
  type: "loading" | "no-data" | "no-result";
};

export function TicketActionEmpty({ type }: TicketActionEmptyProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const messageMap: Record<
    Exclude<TicketActionEmptyProps["type"], "loading">,
    string
  > = {
    "no-data": t("actionTool.list.empty"),
    "no-result": t("actionTool.list.noResult"),
  };

  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 text-sm text-muted-foreground">
      {type === "loading" ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        messageMap[type]
      )}
    </div>
  );
}
