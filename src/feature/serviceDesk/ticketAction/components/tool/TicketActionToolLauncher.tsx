import {
  CheckCircle2,
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
  "approve",
  "decline",
  "comment",
  "note",
  "assign",
  "assignSelf",
  "adjust",
  "merge",
  "reject",
  "reopen",
  "resubmit",
  "cancel",
];

const WORK_PHASE_ACTIONS = new Set<TicketActionMode>([
  "assignSelf",
  "reject",
]);

const APPROVAL_ACTIONS = new Set<TicketActionMode>(["approve", "decline"]);

const VISIBLE_STATUSES_BY_ACTION: Record<
  TicketActionMode,
  readonly TicketStatus[]
> = {
  approve: ["Approval"],
  decline: ["Approval"],
  comment: [
    "Draft",
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  note: [
    "Draft",
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
  ],
  assign: ["Approval", "Assigned", "Working", "Pending"],
  assignSelf: ["Assigned", "Working", "Pending"],
  adjust: [
    "Approval",
    "Assigned",
    "Working",
    "Pending",
    "Resolved",
    "Closed",
  ],
  merge: [
    "Approval",
    "Declined",
    "Assigned",
    "Working",
    "Pending",
    "Rejected",
    "Resolved",
    "Closed",
  ],
  reject: ["Assigned", "Working", "Pending"],
  reopen: ["Resolved"],
  resubmit: ["Declined", "Rejected"],
  cancel: ["Approval", "Declined", "Assigned", "Working", "Pending", "Rejected"],
};

type TicketActionToolLauncherProps = {
  hidden: boolean;
  isPending?: boolean;
  isAdmin?: boolean;
  onOpen: (mode: TicketActionMode) => void;
  ticket: TicketDetail;
};

const actionIcons: Record<TicketActionMode, ReactNode> = {
  approve: <CheckCircle2 className="h-4 w-4" />,
  decline: <XCircle className="h-4 w-4" />,
  comment: <MessageSquarePlus className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
  assign: <UserRoundPlus className="h-4 w-4" />,
  assignSelf: <MessageCircleCheck className="h-4 w-4" />,
  adjust: <Settings2 className="h-4 w-4" />,
  merge: <GitMerge className="h-4 w-4" />,
  reject: <XCircle className="h-4 w-4" />,
  reopen: <MessageCircleWarning className="h-4 w-4" />,
  resubmit: <MessageCircleReply className="h-4 w-4" />,
  cancel: <XCircle className="h-4 w-4" />,
};

export function TicketActionToolLauncher({
  hidden,
  isAdmin = false,
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

        if (
          APPROVAL_ACTIONS.has(action) &&
          (!ticket.active ||
            ticket.assignmentPhase !== "APPROVAL" ||
            (!ticket.assignedApprover && !isAdmin))
        ) {
          return false;
        }

        if (
          WORK_PHASE_ACTIONS.has(action) &&
          (ticket.assignmentPhase !== "WORK" || !ticket.assignedWorker)
        ) {
          return false;
        }

        if (
          action === "assignSelf" &&
          (!ticket.assignedWorker || ticket.workAssigneeUsernames.length < 2)
        ) {
          return false;
        }

        if (action === "assign") {
          if (ticket.status === "Approval") {
            return isAdmin;
          }

          return ticket.assignmentPhase === "WORK" && (ticket.assignedWorker || isAdmin);
        }

        if (action === "adjust") {
          if (ticket.status === "Resolved" || ticket.status === "Closed") {
            return isAdmin;
          }

          if (ticket.status === "Approval") {
            return isAdmin;
          }

          return ticket.assignmentPhase === "WORK" && (ticket.assignedWorker || isAdmin);
        }

        if (action === "merge") {
          return (
            !ticket.mergedIntoTicketId &&
            (isAdmin ||
              (ticket.assignmentPhase === "WORK" && ticket.assignedWorker))
          );
        }

        if (action === "reopen") {
          return ticket.owner || isAdmin;
        }

        if (action === "resubmit" && !ticket.owner) {
          return false;
        }

        if (action === "cancel" && !ticket.owner) {
          return false;
        }

        return true;
      }),
    [
      ticket.active,
      ticket.assignedApprover,
      ticket.assignedWorker,
      ticket.assignmentPhase,
      ticket.mergedIntoTicketId,
      ticket.owner,
      ticket.status,
      ticket.workAssigneeUsernames.length,
      isAdmin,
    ],
  );

  if (hidden) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3 xl:grid-cols-3">
      {actions.map((action) => (
        <LauncherButton
          key={action}
          action={action}
          isPrimary={action === "comment"}
          disabled={isPending}
          onClick={() => onOpen(action)}
        />
      ))}
    </div>
  );
}

function LauncherButton({
  action,
  isPrimary = false,
  disabled = false,
  onClick,
}: {
  action: TicketActionMode;
  isPrimary?: boolean;
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
      className={[
        "min-w-0 items-start justify-start gap-3 rounded-lg border border-border/50 p-3 text-left whitespace-normal transition-colors hover:bg-muted/30",
        "h-auto min-h-24 sm:min-h-28 sm:p-4",
        isPrimary ? "col-span-2 md:col-span-1" : "",
      ].join(" ")}
    >
      <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
        {actionIcons[action]}
      </div>
      <div className="min-w-0 space-y-1">
        <p className="break-words font-medium leading-5">
          {t(getTicketActionModeLabelKey(action))}
        </p>
        <p className="break-words text-sm text-muted-foreground">
          {t(`actionTool.launcher.${action}`)}
        </p>
      </div>
    </Button>
  );
}
