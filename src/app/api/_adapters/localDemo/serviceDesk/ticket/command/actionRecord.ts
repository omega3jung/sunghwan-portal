import { DbTicketAction } from "@/lib/application/contracts/serviceDesk";
import { mapFileToAttach } from "@/lib/application/serviceDesk";

import { LocalActionRuntimeContext } from "./types";

export type CreateTicketActionContext = Pick<
  LocalActionRuntimeContext,
  "ticketId" | "employeeUserName" | "content" | "actionNo" | "createdAt"
>;

const isAttachmentlessAction = (
  actionType: CreateTicketActionContext["content"]["actionType"],
) => actionType === "APPROVE" || actionType === "DECLINE";

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
  owner_username: employeeUserName,

  created_at: createdAt,
  updated_at: null,
  active: true,

  files: isAttachmentlessAction(content.actionType)
    ? []
    : mapFileToAttach(content.files, "file"),
  images: isAttachmentlessAction(content.actionType)
    ? []
    : mapFileToAttach(content.images, "image"),
});
