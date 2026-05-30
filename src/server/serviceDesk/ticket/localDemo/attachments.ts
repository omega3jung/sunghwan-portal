import { Attach } from "@/domain/serviceDesk";
import { TicketAttachmentInput } from "@/feature/serviceDesk/ticket/write";

export function splitAttachments(attachment: TicketAttachmentInput[]) {
  const normalized = attachment.map((item, index) => ({
    name: item.name?.trim() || `attachment-${index + 1}`,
    url: item.url ?? "",
    isImage: (item.type ?? "").toLowerCase().startsWith("image/"),
  }));

  const images: Attach[] = [];
  const files: Attach[] = [];

  normalized.forEach((item) => {
    if (item.isImage) {
      images.push({
        index: images.length,
        type: "image",
        name: item.name,
        url: item.url,
        active: true,
      });
      return;
    }

    files.push({
      index: files.length,
      type: "file",
      name: item.name,
      url: item.url,
      active: true,
    });
  });

  return { files, images };
}
