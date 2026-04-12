import type { Locale } from "date-fns";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { TicketComment } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { cn } from "@/shared/utils";
import { formatDateTime } from "@/shared/utils/comment";
import { formatTimeDistanceFromNow } from "@/shared/utils/date";

type TicketCommentMetaProps = {
  comment: TicketComment;
  owner?: ImageValueLabel;
  dateLocale?: Locale;
};

export function TicketCommentMeta({
  comment,
  owner,
  dateLocale,
}: TicketCommentMetaProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="truncate font-medium">
          {owner?.label || comment.ownerId}
        </p>
        <Badge
          variant="secondary"
          className={cn(
            "capitalize text-xs font-medium",
            comment.visibility === "internal"
              ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
              : "bg-slate-100 text-slate-700 hover:bg-slate-100",
          )}
        >
          {t(`comment.item.visibility.${comment.visibility}`)}
        </Badge>
        <Badge
          variant="outline"
          className="border-border/60 text-xs text-muted-foreground/75"
        >
          {t("comment.item.number", { number: comment.commentNo })}
        </Badge>
      </div>

      <div className="min-w-0 text-xs text-muted-foreground/75">
        <p className="truncate leading-5">
          {owner?.displayName || comment.ownerId}
        </p>
        <p className="leading-5">
          {formatTimeDistanceFromNow(comment.createdAt, dateLocale) || "-"}
          {" | "}
          {formatDateTime(comment.createdAt)}
          {comment.updatedAt ? ` | ${t("comment.item.edited")}` : ""}
        </p>
      </div>
    </div>
  );
}
