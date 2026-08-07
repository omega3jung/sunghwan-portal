import { Attach, TicketAttach } from "@/domain/serviceDesk";

type AttachmentFileInput = {
  id: string;
  name: string;
  size: number;
  url?: string | undefined;
};

/** Maps file to attach values across shared Service Desk policy. */
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
