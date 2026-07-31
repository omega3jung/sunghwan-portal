import { FileText, ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import type { Attach, TicketAttachmentMetadata } from "@/domain/serviceDesk";
import { NS } from "@/lib/application/i18n";
import { bytesToKB } from "@/shared/utils/browser";

type TicketAttachmentListItem = Attach | TicketAttachmentMetadata;

type TicketAttachmentListProps = {
  files: TicketAttachmentListItem[];
  images: TicketAttachmentListItem[];
};

/** Documents the ticket attachment list responsibility exposed by this client feature module. */
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
              const size = getAttachmentSize(image);

              return (
                <Attachment
                  key={getAttachmentKey(image, index)}
                  orientation="vertical"
                  className="w-full overflow-hidden border-border/40 bg-background"
                >
                  <AttachmentMedia variant="image">
                    {href ? (
                      <img
                        src={href}
                        alt={name}
                        className="transition-transform group-hover/attachment:scale-[1.02]"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{name}</AttachmentTitle>
                    {size === undefined ? null : (
                      <AttachmentDescription>
                        {bytesToKB(size)} KB
                      </AttachmentDescription>
                    )}
                  </AttachmentContent>
                  {href ? (
                    <AttachmentTrigger
                      render={
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={name}
                        />
                      }
                    />
                  ) : null}
                </Attachment>
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
              const name = getAttachmentName(file);
              const size = getAttachmentSize(file);

              return (
                <Attachment
                  key={getAttachmentKey(file, index)}
                  size="sm"
                  className="flex-nowrap rounded-full border-border/40 bg-background"
                >
                  <AttachmentMedia>
                    <FileText />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{name}</AttachmentTitle>
                    {size === undefined ? null : (
                      <AttachmentDescription>
                        {bytesToKB(size)} KB
                      </AttachmentDescription>
                    )}
                  </AttachmentContent>
                  {href ? (
                    <AttachmentTrigger
                      render={
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={name}
                        />
                      }
                    />
                  ) : null}
                </Attachment>
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

function getAttachmentSize(
  item: TicketAttachmentListItem,
): number | undefined {
  return "size" in item ? item.size : undefined;
}
