import { DbTicketAction } from "@/lib/application/contracts/serviceDesk";
import { mapFileToAttach } from "@/lib/application/serviceDesk";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";

import { LocalActionRuntimeContext } from "./types";

/** Describes create ticket action context used by the server-side LOCAL ticket adapter. */
export type CreateTicketActionContext = Pick<
  LocalActionRuntimeContext,
  "ticketId" | "employeeUserName" | "content" | "actionNo" | "createdAt"
>;

const isAttachmentlessAction = (
  actionType: CreateTicketActionContext["content"]["actionType"],
) => actionType === "APPROVE" || actionType === "DECLINE";

/**
 * Builds the LOCAL persistence-shaped action row without mutating state.
 * Approval decisions deliberately discard attachment input, matching the
 * REMOTE command contract that accepts text-only approval evidence.
 */
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
  owner_name:
    allEmployeesMock.find(
      (employee) => employee.e_username === employeeUserName,
    )?.e_name ?? null,

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
