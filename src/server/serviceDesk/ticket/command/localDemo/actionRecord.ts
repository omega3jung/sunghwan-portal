import { mapFileToAttach } from "@/feature/serviceDesk/shared/utils/mapFileToAttach";
import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { LocalActionRuntimeContext } from "../types";

export type CreateTicketActionContext = Pick<
  LocalActionRuntimeContext,
  "ticketId" | "employeeUserName" | "content" | "actionNo" | "createdAt"
>;

export const createTicketAction = ({
  ticketId,
  employeeUserName,
  content,
  actionNo,
  createdAt,
}: CreateTicketActionContext): DbTicketAction => ({
  ticket_id: ticketId,
  action_no: actionNo,

  action_type: content.actionType,
  content: content.content,
  owner_id: employeeUserName,

  created_at: createdAt,
  updated_at: null,
  active: true,

  files: mapFileToAttach(content.files, "file"),
  images: mapFileToAttach(content.images, "image"),
});
