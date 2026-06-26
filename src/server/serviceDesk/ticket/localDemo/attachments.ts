import { Attach } from "@/domain/serviceDesk";

type LegacyTicketAttachmentInput = {
  name?: string;
  type?: string;
  url?: string;
};

export function splitAttachments(attachment: LegacyTicketAttachmentInput[]) {
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
