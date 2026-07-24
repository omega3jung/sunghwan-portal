import { FileText, ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Attach, TicketAttachmentMetadata } from "@/domain/serviceDesk";
import { NS } from "@/lib/application/i18n";

type TicketAttachmentListItem = Attach | TicketAttachmentMetadata;

type TicketAttachmentListProps = {
  files: TicketAttachmentListItem[];
  images: TicketAttachmentListItem[];
};

export function TicketAttachmentList({
  files,
  images,
}: TicketAttachmentListProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const hasAttachments = files.length > 0 || images.length > 0;

  if (!hasAttachments) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/40 bg-muted/10 p-3">
      {images.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/75">
            <ImageIcon className="h-3.5 w-3.5" />
            {t("comment.attachments.images")}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => {
              const href = getAttachmentHref(image);
              const name = getAttachmentName(image);

              return (
                <a
                  key={getAttachmentKey(image, index)}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-lg border border-border/40 bg-background"
                >
                  {href ? (
                    <img
                      src={href}
                      alt={name}
                      className="h-36 w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-muted/60 text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                  <div className="truncate border-t border-border/40 px-3 py-2 text-xs text-muted-foreground/75">
                    {name}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/75">
            <FileText className="h-3.5 w-3.5" />
            {t("comment.attachments.files")}
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => {
              const href = getAttachmentHref(file);

              return (
                <a
                  key={getAttachmentKey(file, index)}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/40 bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted/30"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{getAttachmentName(file)}</span>
                </a>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getAttachmentName(item: TicketAttachmentListItem): string {
  return "originalName" in item ? item.originalName : item.name;
}

function getAttachmentKey(
  item: TicketAttachmentListItem,
  fallbackIndex: number,
): string {
  const index = "index" in item ? item.index : fallbackIndex;
  const name = "replacedName" in item ? item.replacedName : item.name;
  return `${index}-${name}`;
}

function getAttachmentHref(
  item: TicketAttachmentListItem,
): string | undefined {
  if ("url" in item && item.url) {
    return item.url;
  }

  return "demoUrl" in item ? item.demoUrl : undefined;
}
