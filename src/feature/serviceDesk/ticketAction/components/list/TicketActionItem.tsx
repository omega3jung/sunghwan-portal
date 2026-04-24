import type { Locale } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { TicketAction } from "@/domain/serviceDesk";
import { TicketAttachmentList } from "@/feature/serviceDesk/shared";
import { NS } from "@/lib/i18n";
import type { ImageValueLabel } from "@/shared/types";
import { initials } from "@/shared/utils/string";

import { TicketActionBody } from "./TicketActionBody";
import { TicketActionMeta } from "./TicketActionMeta";

type TicketActionItemProps = {
  action: TicketAction;
  owner?: ImageValueLabel;
  dateLocale?: Locale;
  defaultOpen?: boolean;
};

export function TicketActionItem({
  action,
  owner,
  dateLocale,
  defaultOpen = false,
}: TicketActionItemProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const files = action.files.filter((file) => file.active);
  const images = action.images.filter((image) => image.active);
  const ownerLabel =
    owner?.label ||
    t("actionTool.list.unknownOwner", { defaultValue: "Unknown employee" });

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="rounded-lg border border-border/40 bg-background transition-colors hover:bg-muted/20"
    >
      <div className="flex gap-3 p-4">
        <Avatar className="mt-0.5 h-10 w-10 ring-1 ring-border/40">
          <AvatarImage src={owner?.image} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials(ownerLabel)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <TicketActionMeta
              action={action}
              owner={owner}
              dateLocale={dateLocale}
            />

            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-end rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground md:self-start [&[data-state=open]>svg]:rotate-180"
              >
                <ChevronDown className="h-4 w-4 transition-transform" />
                <span className="sr-only">
                  {t("actionTool.list.toggleDetails")}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-4 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <TicketActionBody content={action.content} />
            <TicketAttachmentList files={files} images={images} />
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}
