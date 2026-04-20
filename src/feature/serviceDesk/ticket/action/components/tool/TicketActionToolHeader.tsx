import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NS } from "@/lib/i18n";
import { initials } from "@/shared/utils/string";

import type { TicketActionMode } from "../../types";

type TicketActionToolHeaderProps = {
  currentUserEmail: string;
  currentUserImage?: string;
  currentUserName: string;
  mode: Exclude<TicketActionMode, "idle">;
};

export function TicketActionToolHeader({
  currentUserEmail,
  currentUserImage,
  currentUserName,
  mode,
}: TicketActionToolHeaderProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 ring-1 ring-border/40">
          <AvatarImage src={currentUserImage} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials(currentUserName || t("actionTool.currentUser"))}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{currentUserName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentUserEmail || t("actionTool.currentUser")}
          </p>
        </div>
      </div>

      <Badge
        variant="secondary"
        className="w-fit rounded-md bg-primary/10 px-3 py-1 text-primary"
      >
        {t(`action.${mode}`)}
      </Badge>
    </div>
  );
}
