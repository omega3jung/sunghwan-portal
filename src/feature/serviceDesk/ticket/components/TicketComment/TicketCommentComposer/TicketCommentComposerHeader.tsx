import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { NS } from "@/lib/i18n";
import { cn } from "@/shared/utils";
import { initials } from "@/shared/utils/string";

import type { TicketCommentComposerMode } from "./TicketCommentComposer";

type TicketCommentComposerHeaderProps = {
  currentUserEmail: string;
  currentUserImage?: string;
  currentUserName: string;
  helperText: string;
  mode: Exclude<TicketCommentComposerMode, "toolbar">;
  showHeader?: boolean;
  onModeChange: (mode: Exclude<TicketCommentComposerMode, "toolbar">) => void;
};

export function TicketCommentComposerHeader({
  currentUserEmail,
  currentUserImage,
  currentUserName,
  helperText,
  mode,
  showHeader = true,
  onModeChange,
}: TicketCommentComposerHeaderProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        showHeader && "lg:flex-row lg:items-center lg:justify-between",
        !showHeader && "items-start sm:items-end",
      )}
    >
      {showHeader ? (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-1 ring-border/40">
            <AvatarImage src={currentUserImage} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(currentUserName || t("comment.composer.currentUser"))}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{currentUserName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {currentUserEmail || helperText}
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-border/50 bg-background p-1">
        <ToggleGroup
          type="single"
          value={mode}
          variant="default"
          size="sm"
          onValueChange={(value) => {
            if (value === "public" || value === "internal") {
              onModeChange(value);
            }
          }}
        >
          <ModeButton value="public">{t("action.comment")}</ModeButton>
          <ModeButton value="internal">
            {t("comment.composer.internalNoteLabel")}
          </ModeButton>
        </ToggleGroup>
      </div>
    </div>
  );
}

function ModeButton({
  children,
  value,
}: {
  children: ReactNode;
  value: "public" | "internal";
}) {
  return (
    <ToggleGroupItem
      value={value}
      className="h-auto min-w-0 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
    >
      {children}
    </ToggleGroupItem>
  );
}
