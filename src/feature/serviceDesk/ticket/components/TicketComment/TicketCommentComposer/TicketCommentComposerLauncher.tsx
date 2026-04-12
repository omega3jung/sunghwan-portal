import { MessageSquarePlus, StickyNote } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { NS } from "@/lib/i18n";

type TicketCommentComposerLauncherProps = {
  hidden: boolean;
  onOpenPublic: () => void;
  onOpenInternal: () => void;
};

export function TicketCommentComposerLauncher({
  hidden,
  onOpenPublic,
  onOpenInternal,
}: TicketCommentComposerLauncherProps) {
  const { t } = useTranslation(NS.serviceDesk);

  if (hidden) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <LauncherButton
        icon={<MessageSquarePlus className="h-4 w-4" />}
        title={t("action.comment")}
        description={t("comment.composer.launcherPublicDescription")}
        onClick={onOpenPublic}
      />
      <LauncherButton
        icon={<StickyNote className="h-4 w-4" />}
        title={t("comment.composer.internalNoteLabel")}
        description={t("comment.composer.launcherInternalDescription")}
        onClick={onOpenInternal}
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
      className="h-28 flex-1 items-start justify-start gap-3 rounded-lg border border-border/50 p-4 text-left transition-colors hover:bg-muted/30"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </Button>
  );
}
