import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";

import { TicketCommentSearchBar } from "./TicketCommentSearchBar";
import { TicketCommentSortButton } from "./TicketCommentSortButton";

type TicketCommentListHeaderProps = {
  count: number;
  query: string;
  sortOrder: "desc" | "asc";
  showHeader?: boolean;
  onQueryChange: (value: string) => void;
  onToggleSort: () => void;
};

export function TicketCommentListHeader({
  count,
  query,
  sortOrder,
  showHeader = true,
  onQueryChange,
  onToggleSort,
}: TicketCommentListHeaderProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        showHeader && "md:flex-row md:items-center md:justify-between",
        !showHeader && "sm:flex-row sm:items-center sm:justify-end",
      )}
    >
      {showHeader ? (
        <div className="flex items-center gap-2">
          <h2
            className="text-base font-semibold tracking-[-0.01em]"
            title={t("comment.list.titleHint")}
          >
            {t("recentActivity.conversation.label")}
          </h2>
          {count ? (
            <>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-muted"
              >
                {count}
              </Badge>
              <span className="text-sm text-muted-foreground/75">
                {t("comment.list.countLabel", { count })}
              </span>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <TicketCommentSearchBar value={query} onChange={onQueryChange} />
        <TicketCommentSortButton sortOrder={sortOrder} onClick={onToggleSort} />
      </div>
    </div>
  );
}
