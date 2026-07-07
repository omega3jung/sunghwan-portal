import { Attach, TicketAttachmentMetadata } from "@/domain/serviceDesk";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";

import { TICKET_2026_1 } from "./SP-2026-0001";
import { TICKET_2026_2 } from "./SP-2026-0002";
import { TICKET_2026_3 } from "./SP-2026-0003";
import { TICKET_2026_4 } from "./SP-2026-0004";
import { TICKET_2026_5 } from "./SP-2026-0005";
import { TICKET_2026_6 } from "./SP-2026-0006";
import { TICKET_2026_7 } from "./SP-2026-0007";
import { TICKET_2026_8 } from "./SP-2026-0008";
import { TICKET_2026_11 } from "./SP-2026-0011";
import { TICKET_2026_12 } from "./SP-2026-0012";
import { TICKET_2026_13 } from "./SP-2026-0013";
import { TICKET_2026_14 } from "./SP-2026-0014";
import { TICKET_2026_15 } from "./SP-2026-0015";
import { TICKET_2026_16 } from "./SP-2026-0016";
import { TICKET_2026_17 } from "./SP-2026-0017";
import { TICKET_2026_18 } from "./SP-2026-0018";
import { TICKET_2026_21 } from "./SP-2026-0021";
import { TICKET_2026_22 } from "./SP-2026-0022";
import { TICKET_2026_23 } from "./SP-2026-0023";
import { TICKET_2026_24 } from "./SP-2026-0024";
import { TICKET_2026_25 } from "./SP-2026-0025";
import { TICKET_2026_26 } from "./SP-2026-0026";
import { TICKET_2026_27 } from "./SP-2026-0027";
import { TICKET_2026_28 } from "./SP-2026-0028";
import { TICKET_2026_31 } from "./SP-2026-0031";
import { TICKET_2026_32 } from "./SP-2026-0032";
import { TICKET_2026_33 } from "./SP-2026-0033";
import { TICKET_2026_34 } from "./SP-2026-0034";
import { TICKET_2026_35 } from "./SP-2026-0035";
import { TICKET_2026_36 } from "./SP-2026-0036";
import { TICKET_2026_37 } from "./SP-2026-0037";
import { TICKET_2026_38 } from "./SP-2026-0038";
import { TicketMockInput } from "./types";

const internalTicketMockInputs: TicketMockInput[] = [
  TICKET_2026_1.ticket,
  TICKET_2026_2.ticket,
  TICKET_2026_3.ticket,
  TICKET_2026_4.ticket,
  TICKET_2026_5.ticket,
  TICKET_2026_6.ticket,
  TICKET_2026_7.ticket,
  TICKET_2026_8.ticket,
  TICKET_2026_11.ticket,
  TICKET_2026_12.ticket,
  TICKET_2026_13.ticket,
  TICKET_2026_14.ticket,
  TICKET_2026_15.ticket,
  TICKET_2026_16.ticket,
  TICKET_2026_17.ticket,
  TICKET_2026_18.ticket,
  TICKET_2026_21.ticket,
  TICKET_2026_22.ticket,
  TICKET_2026_23.ticket,
  TICKET_2026_24.ticket,
  TICKET_2026_25.ticket,
  TICKET_2026_26.ticket,
  TICKET_2026_27.ticket,
  TICKET_2026_28.ticket,
  TICKET_2026_31.ticket,
  TICKET_2026_32.ticket,
  TICKET_2026_33.ticket,
  TICKET_2026_34.ticket,
  TICKET_2026_35.ticket,
  TICKET_2026_36.ticket,
  TICKET_2026_37.ticket,
  TICKET_2026_38.ticket,
];

const toDbTicketDetail = (ticket: TicketMockInput): DbTicketDetail => ({
  id: ticket.tk_id,
  ticket_number: ticket.tk_ticket_no,
  created_at: ticket.tk_created_at,
  updated_at: ticket.tk_updated_at,
  requester_username: ticket.tk_requester_username,
  status: ticket.tk_status,
  close_reason: ticket.tk_close_reason,
  priority: ticket.tk_priority,
  risk_level: ticket.tk_risk_level,
  assignee_usernames: ticket.tk_assignee_usernames,
  merged_into_ticket_id: ticket.tk_merged_into_ticket_id,
  merged_into_ticket_no: ticket.tk_merged_into_ticket_no,
  last_comment_at: ticket.tka_last_comment_at,
  last_commenter_email: ticket.tka_last_comment_email,
  last_user_activity_at: ticket.tka_last_user_activity_at,
  last_user_activity_email: ticket.tka_last_user_activity_email,
  work_minutes: ticket.tk_work_minutes,
  due_at: ticket.tk_due_at,
  owner: false,
  assigned: false,
  active: ticket.tk_active,
  scope: ticket.cat_scope,
  category_id: ticket.cat_id,
  category_name: ticket.cat_name,
  approval_step_id: ticket.tk_approval_step_id,
  subject: ticket.tk_subject,
  content: ticket.tk_content,
  email: ticket.tk_email,
  files: ticket.tk_files.map(toTicketAttachmentMetadata),
  images: ticket.tk_images.map(toTicketAttachmentMetadata),
});

export const internalTicketsMock: DbTicketDetail[] =
  internalTicketMockInputs.map(toDbTicketDetail);

function toTicketAttachmentMetadata(
  attachment: Attach,
): TicketAttachmentMetadata {
  const demoUrl = normalizeDemoUrl(attachment);

  return {
    originalName: attachment.name,
    replacedName: demoUrl.split("/").pop() ?? "demo-file",
    extension: demoUrl.split(".").pop() ?? "txt",
    size: 0,
    type: attachment.type === "image" ? "image/png" : "application/octet-stream",
    demoUrl,
    replaced: true,
    reason: "SECURITY_DEMO_REPLACEMENT",
  };
}

function normalizeDemoUrl(attachment: Attach) {
  if (/^\/files\/demo-[a-z0-9-]+\.[a-z0-9]+$/i.test(attachment.url)) {
    return attachment.url;
  }

  return attachment.type === "image"
    ? "/files/demo-png.png"
    : "/files/demo-txt.txt";
}
