import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { NS } from "@/lib/i18n";

type TicketCommentEmptyProps = {
  type: "loading" | "no-data" | "no-result";
};

export function TicketCommentEmpty({ type }: TicketCommentEmptyProps) {
  const { t } = useTranslation(NS.serviceDesk);

  const emptyStateMessageMap: Record<
    Exclude<TicketCommentEmptyProps["type"], "loading">,
    string
  > = {
    "no-data": t("recentActivity.conversation.empty"),
    "no-result": t("comment.empty.noResult"),
  };

  return (
    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 text-sm text-muted-foreground">
      {type === "loading" ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        emptyStateMessageMap[type]
      )}
    </div>
  );
}
