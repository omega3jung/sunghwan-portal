import type { Locale } from "date-fns";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { TicketAction } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import {
  formatDateTime,
  formatTimeDistanceFromNow,
} from "@/shared/utils/format";
import { cn } from "@/shared/utils/presentation";

import { getTicketActionTypeLabelKey } from "../../mapper";

type TicketActionMetaProps = {
  action: TicketAction;
  owner?: ImageValueLabel;
  dateLocale?: Locale;
};

const ACTION_BADGE_CLASSNAME: Record<TicketAction["actionType"], string> = {
  APPROVE: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  DECLINE: "bg-rose-50 text-rose-700 hover:bg-rose-50",
  COMMENT: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  NOTE: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  ASSIGN: "bg-sky-50 text-sky-700 hover:bg-sky-50",
  ASSIGN_SELF: "bg-lime-50 text-lime-700 hover:bg-lime-50",
  REJECT: "bg-rose-50 text-rose-700 hover:bg-rose-50",
  MERGE: "bg-violet-50 text-violet-700 hover:bg-violet-50",
  ADJUST: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  REOPEN: "bg-orange-50 text-orange-700 hover:bg-orange-50",
  RESUBMIT: "bg-cyan-50 text-cyan-700 hover:bg-cyan-50",
  CANCEL: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100",
};

export function TicketActionMeta({
  action,
  owner,
  dateLocale,
}: TicketActionMetaProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const ownerLabel =
    owner?.label ||
    t("actionTool.list.unknownOwner", { defaultValue: "Unknown employee" });
  const ownerSubText = owner?.displayName || "-";

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 break-words font-medium">{ownerLabel}</p>
        <Badge
          variant="secondary"
          className={cn(
            "capitalize text-xs font-medium",
            ACTION_BADGE_CLASSNAME[action.actionType],
          )}
        >
          {t(getTicketActionTypeLabelKey(action.actionType))}
        </Badge>
        <Badge
          variant="outline"
          className="border-border/60 text-xs text-muted-foreground/75"
        >
          {t("actionTool.list.number", { number: action.actionNo })}
        </Badge>
      </div>

      <div className="min-w-0 break-words text-xs text-muted-foreground/75">
        <p className="break-words leading-5">{ownerSubText}</p>
        <p className="break-words leading-5">
          {formatTimeDistanceFromNow(action.createdAt, dateLocale) || "-"}
          {" | "}
          {formatDateTime(action.createdAt)}
          {action.updatedAt ? ` | ${t("actionTool.list.edited")}` : ""}
        </p>
      </div>
    </div>
  );
}
