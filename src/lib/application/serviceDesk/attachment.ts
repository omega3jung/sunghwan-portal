import { Attach, TicketAttach } from "@/domain/serviceDesk";

type AttachmentFileInput = {
  id: string;
  name: string;
  size: number;
  url?: string | undefined;
};

export const mapFileToAttach = (
  files: AttachmentFileInput[],
  type: TicketAttach,
) => {
  const mapped = files.map((file, index) => {
    return {
      index,
      type,
      name: file.name,
      url: file.url,
      active: true,
    } as Attach;
  });

  return mapped;
};
