import {
  GitMerge,
  MessageSquarePlus,
  Settings2,
  StickyNote,
  UserRoundPlus,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/i18n";

import type { TicketActionMode } from "./TicketActionTool";

type TicketActionToolLauncherProps = {
  hidden: boolean;
  onOpen: (mode: Exclude<TicketActionMode, "idle">) => void;
};

export function TicketActionToolLauncher({
  hidden,
  onOpen,
}: TicketActionToolLauncherProps) {
  const { t } = useTranslation(NS.serviceDesk);

  if (hidden) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <LauncherButton
        icon={<MessageSquarePlus className="h-4 w-4" />}
        title={t("actionTool.launcherTitle.comment")}
        description={t("actionTool.launcher.comment")}
        onClick={() => onOpen("comment")}
      />
      <LauncherButton
        icon={<StickyNote className="h-4 w-4" />}
        title={t("actionTool.launcherTitle.note")}
        description={t("actionTool.launcher.note")}
        onClick={() => onOpen("note")}
      />
      <LauncherButton
        icon={<UserRoundPlus className="h-4 w-4" />}
        title={t("actionTool.launcherTitle.assign")}
        description={t("actionTool.launcher.assign")}
        onClick={() => onOpen("assign")}
      />
      <LauncherButton
        icon={<Settings2 className="h-4 w-4" />}
        title={t("actionTool.launcherTitle.adjust")}
        description={t("actionTool.launcher.adjust")}
        onClick={() => onOpen("adjust")}
      />
      <LauncherButton
        icon={<GitMerge className="h-4 w-4" />}
        title={t("actionTool.launcherTitle.merge")}
        description={t("actionTool.launcher.merge")}
        onClick={() => onOpen("merge")}
      />
      <LauncherButton
        icon={<XCircle className="h-4 w-4" />}
        title={t("actionTool.launcherTitle.reject")}
        description={t("actionTool.launcher.reject")}
        onClick={() => onOpen("reject")}
      />
    </div>
  );
}

function LauncherButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="h-28 items-start justify-start gap-3 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-muted/30"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground text-wrap">{description}</p>
      </div>
    </Button>
  );
}
