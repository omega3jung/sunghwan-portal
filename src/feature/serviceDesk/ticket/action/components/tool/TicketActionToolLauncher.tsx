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

import { getExecutableTicketActionModes } from "@/app/api/service-desk/tickets/[ticketId]/command/[action]/execution";
import { Button } from "@/components/ui/button";
import { TicketDetail } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";

import type { TicketActionFormMode, TicketActionMode } from "../../types";

type TicketActionToolLauncherProps = {
  hidden: boolean;
  onOpen: (mode: Exclude<TicketActionMode, "idle">) => void;
  ticket: TicketDetail;
};

const actionIcons: Record<TicketActionFormMode, ReactNode> = {
  comment: <MessageSquarePlus className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
  assign: <UserRoundPlus className="h-4 w-4" />,
  adjust: <Settings2 className="h-4 w-4" />,
  merge: <GitMerge className="h-4 w-4" />,
  reject: <XCircle className="h-4 w-4" />,
  reportResolved: <MessageCircleWarning className="h-4 w-4" />,
  reviewRejected: <MessageCircleReply className="h-4 w-4" />,
  assignMyself: <MessageCircleCheck className="h-4 w-4" />,

  // to pass esLint.
  assignManager: <UserRoundPlus className="h-4 w-4" />,
  adjustManager: <Settings2 className="h-4 w-4" />,
  mergeManager: <GitMerge className="h-4 w-4" />,
  rejectManager: <XCircle className="h-4 w-4" />,
};

export function TicketActionToolLauncher({
  hidden,
  onOpen,
  ticket,
}: TicketActionToolLauncherProps) {
  const actions = useMemo<TicketActionFormMode[]>(
    () => getExecutableTicketActionModes(ticket),
    [ticket],
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
          onClick={() => onOpen(action)}
        />
      ))}
    </div>
  );
}

function LauncherButton({
  action,
  onClick,
}: {
  action: TicketActionFormMode;
  onClick: () => void;
}) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-28 items-start justify-start gap-3 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-muted/30"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary">
        {actionIcons[action]}
      </div>
      <div className="space-y-1">
        <p className="font-medium">{t(`actionTool.launcherTitle.${action}`)}</p>
        <p className="text-sm text-muted-foreground text-wrap">
          {t(`actionTool.launcher.${action}`)}
        </p>
      </div>
    </Button>
  );
}
