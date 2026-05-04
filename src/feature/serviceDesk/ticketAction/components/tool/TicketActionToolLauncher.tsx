import {
  GitMerge,
  MessageCircleCheck,
  MessageCircleReply,
  MessageCircleWarning,
  MessageSquarePlus,
  Settings2,
  StickyNote,
  UserRoundPlus,
  XCircle,
} from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import type { TicketDetail, TicketStatus } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";

import { getTicketActionModeLabelKey } from "../../mapper";
import type { TicketActionMode } from "../../types";

const ALL_TOOL_ACTIONS: TicketActionMode[] = [
  "comment",
  "note",
  "assign",
  "assignSelf",
  "adjust",
  "merge",
  "reject",
  "reopen",
  "resubmit",
];

const VISIBLE_STATUSES_BY_ACTION: Record<
  TicketActionMode,
  readonly TicketStatus[]
> = {
  comment: [
    "Draft",
    "Open",
    "Approved",
    "Declined",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Reopen",
    "Closed",
  ],
  note: [
    "Draft",
    "Open",
    "Approved",
    "Declined",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Reopen",
    "Closed",
  ],
  assign: ["Open", "Approved", "Declined", "Working", "Rejected", "Reopen"],
  assignSelf: ["Open", "Approved", "Working"],
  adjust: [
    "Open",
    "Approved",
    "Declined",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Reopen",
    "Closed",
  ],
  merge: [
    "Open",
    "Approved",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  reject: ["Open", "Approved", "Working", "Pending"],
  reopen: ["Resolved"],
  resubmit: ["Rejected"],
};

type TicketActionToolLauncherProps = {
  hidden: boolean;
  isPending?: boolean;
  onOpen: (mode: TicketActionMode) => void;
  ticket: TicketDetail;
};

const actionIcons: Record<TicketActionMode, ReactNode> = {
  comment: <MessageSquarePlus className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
  assign: <UserRoundPlus className="h-4 w-4" />,
  assignSelf: <MessageCircleCheck className="h-4 w-4" />,
  adjust: <Settings2 className="h-4 w-4" />,
  merge: <GitMerge className="h-4 w-4" />,
  reject: <XCircle className="h-4 w-4" />,
  reopen: <MessageCircleWarning className="h-4 w-4" />,
  resubmit: <MessageCircleReply className="h-4 w-4" />,
};

export function TicketActionToolLauncher({
  hidden,
  isPending = false,
  onOpen,
  ticket,
}: TicketActionToolLauncherProps) {
  const actions = useMemo<TicketActionMode[]>(
    () =>
      ALL_TOOL_ACTIONS.filter((action) => {
        if (!VISIBLE_STATUSES_BY_ACTION[action].includes(ticket.status)) {
          return false;
        }

        if (action === "assignSelf" && ticket.assigned) {
          return false;
        }

        return true;
      }),
    [ticket.assigned, ticket.status],
  );

  if (hidden) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => (
        <LauncherButton
          key={action}
          action={action}
          disabled={isPending}
          onClick={() => onOpen(action)}
        />
      ))}
    </div>
  );
}

function LauncherButton({
  action,
  disabled = false,
  onClick,
}: {
  action: TicketActionMode;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className="h-28 items-start justify-start gap-3 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-muted/30"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary">
        {actionIcons[action]}
      </div>
      <div className="space-y-1">
        <p className="font-medium">{t(getTicketActionModeLabelKey(action))}</p>
        <p className="text-sm text-muted-foreground text-wrap">
          {t(`actionTool.launcher.${action}`)}
        </p>
      </div>
    </Button>
  );
}
