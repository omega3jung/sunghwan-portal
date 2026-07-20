import { Attach, TicketAttachmentMetadata } from "@/domain/serviceDesk";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";

import { TICKET_2026_1 } from "./en/SP-2026-0001";
import { TICKET_2026_2 } from "./en/SP-2026-0002";
import { TICKET_2026_3 } from "./en/SP-2026-0003";
import { TICKET_2026_4 } from "./en/SP-2026-0004";
import { TICKET_2026_5 } from "./en/SP-2026-0005";
import { TICKET_2026_6 } from "./en/SP-2026-0006";
import { TICKET_2026_7 } from "./en/SP-2026-0007";
import { TICKET_2026_8 } from "./en/SP-2026-0008";
import { TICKET_2026_9 } from "./en/SP-2026-0009";
import { TICKET_2026_10 } from "./en/SP-2026-0010";
import { TICKET_2026_11 } from "./en/SP-2026-0011";
import { TICKET_2026_12 } from "./en/SP-2026-0012";
import { TICKET_2026_13 } from "./en/SP-2026-0013";
import { TICKET_2026_14 } from "./en/SP-2026-0014";
import { TICKET_2026_15 } from "./en/SP-2026-0015";
import { TICKET_2026_16 } from "./en/SP-2026-0016";
import { TICKET_2026_21 } from "./es/SP-2026-0021";
import { TICKET_2026_22 } from "./es/SP-2026-0022";
import { TICKET_2026_23 } from "./es/SP-2026-0023";
import { TICKET_2026_24 } from "./es/SP-2026-0024";
import { TICKET_2026_25 } from "./es/SP-2026-0025";
import { TICKET_2026_26 } from "./es/SP-2026-0026";
import { TICKET_2026_27 } from "./es/SP-2026-0027";
import { TICKET_2026_28 } from "./es/SP-2026-0028";
import { TICKET_2026_29 } from "./es/SP-2026-0029";
import { TICKET_2026_30 } from "./es/SP-2026-0030";
import { TICKET_2026_31 } from "./es/SP-2026-0031";
import { TICKET_2026_32 } from "./es/SP-2026-0032";
import { TICKET_2026_33 } from "./es/SP-2026-0033";
import { TICKET_2026_34 } from "./es/SP-2026-0034";
import { TICKET_2026_35 } from "./es/SP-2026-0035";
import { TICKET_2026_36 } from "./es/SP-2026-0036";
import { TICKET_2026_41 } from "./fr/SP-2026-0041";
import { TICKET_2026_42 } from "./fr/SP-2026-0042";
import { TICKET_2026_43 } from "./fr/SP-2026-0043";
import { TICKET_2026_44 } from "./fr/SP-2026-0044";
import { TICKET_2026_45 } from "./fr/SP-2026-0045";
import { TICKET_2026_46 } from "./fr/SP-2026-0046";
import { TICKET_2026_47 } from "./fr/SP-2026-0047";
import { TICKET_2026_48 } from "./fr/SP-2026-0048";
import { TICKET_2026_49 } from "./fr/SP-2026-0049";
import { TICKET_2026_50 } from "./fr/SP-2026-0050";
import { TICKET_2026_51 } from "./fr/SP-2026-0051";
import { TICKET_2026_52 } from "./fr/SP-2026-0052";
import { TICKET_2026_53 } from "./fr/SP-2026-0053";
import { TICKET_2026_54 } from "./fr/SP-2026-0054";
import { TICKET_2026_55 } from "./fr/SP-2026-0055";
import { TICKET_2026_56 } from "./fr/SP-2026-0056";
import { TICKET_2026_61 } from "./ko/SP-2026-0061";
import { TICKET_2026_62 } from "./ko/SP-2026-0062";
import { TICKET_2026_63 } from "./ko/SP-2026-0063";
import { TICKET_2026_64 } from "./ko/SP-2026-0064";
import { TICKET_2026_65 } from "./ko/SP-2026-0065";
import { TICKET_2026_66 } from "./ko/SP-2026-0066";
import { TICKET_2026_67 } from "./ko/SP-2026-0067";
import { TICKET_2026_68 } from "./ko/SP-2026-0068";
import { TICKET_2026_69 } from "./ko/SP-2026-0069";
import { TICKET_2026_70 } from "./ko/SP-2026-0070";
import { TICKET_2026_71 } from "./ko/SP-2026-0071";
import { TICKET_2026_72 } from "./ko/SP-2026-0072";
import { TICKET_2026_73 } from "./ko/SP-2026-0073";
import { TICKET_2026_74 } from "./ko/SP-2026-0074";
import { TICKET_2026_75 } from "./ko/SP-2026-0075";
import { TICKET_2026_76 } from "./ko/SP-2026-0076";
import { TicketMockInput } from "./types";

const internalTicketMockInputs: TicketMockInput[] = [
  TICKET_2026_1.ticket,
  TICKET_2026_2.ticket,
  TICKET_2026_3.ticket,
  TICKET_2026_4.ticket,
  TICKET_2026_5.ticket,
  TICKET_2026_6.ticket,
  TICKET_2026_7.ticket,
  TICKET_2026_9.ticket,
  TICKET_2026_10.ticket,
  TICKET_2026_11.ticket,
  TICKET_2026_12.ticket,
  TICKET_2026_13.ticket,
  TICKET_2026_14.ticket,
  TICKET_2026_15.ticket,
  TICKET_2026_16.ticket,
  TICKET_2026_8.ticket,
  TICKET_2026_21.ticket,
  TICKET_2026_22.ticket,
  TICKET_2026_23.ticket,
  TICKET_2026_24.ticket,
  TICKET_2026_25.ticket,
  TICKET_2026_26.ticket,
  TICKET_2026_27.ticket,
  TICKET_2026_29.ticket,
  TICKET_2026_30.ticket,
  TICKET_2026_31.ticket,
  TICKET_2026_32.ticket,
  TICKET_2026_33.ticket,
  TICKET_2026_34.ticket,
  TICKET_2026_35.ticket,
  TICKET_2026_36.ticket,
  TICKET_2026_28.ticket,
  TICKET_2026_41.ticket,
  TICKET_2026_42.ticket,
  TICKET_2026_43.ticket,
  TICKET_2026_44.ticket,
  TICKET_2026_45.ticket,
  TICKET_2026_46.ticket,
  TICKET_2026_47.ticket,
  TICKET_2026_49.ticket,
  TICKET_2026_50.ticket,
  TICKET_2026_51.ticket,
  TICKET_2026_52.ticket,
  TICKET_2026_53.ticket,
  TICKET_2026_54.ticket,
  TICKET_2026_55.ticket,
  TICKET_2026_56.ticket,
  TICKET_2026_48.ticket,
  TICKET_2026_61.ticket,
  TICKET_2026_62.ticket,
  TICKET_2026_63.ticket,
  TICKET_2026_64.ticket,
  TICKET_2026_65.ticket,
  TICKET_2026_66.ticket,
  TICKET_2026_67.ticket,
  TICKET_2026_69.ticket,
  TICKET_2026_70.ticket,
  TICKET_2026_71.ticket,
  TICKET_2026_72.ticket,
  TICKET_2026_73.ticket,
  TICKET_2026_74.ticket,
  TICKET_2026_75.ticket,
  TICKET_2026_76.ticket,
  TICKET_2026_68.ticket,
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
    type:
      attachment.type === "image" ? "image/png" : "application/octet-stream",
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
