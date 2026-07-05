import { ISODateString } from "@/shared/types";

import {
  normalizeTicketAttachmentMetadata,
  normalizeTicketEmail,
} from "./ticketMapper";
import { RequesterUpdateTicketRequestDto } from "./ticketUpdateDto";
import { RequesterUpdateTicketRowInput } from "./ticketUpdateRow";

export function mapRequesterUpdateTicketRequestDtoToRowInput(
  input: RequesterUpdateTicketRequestDto,
  state: Pick<
    RequesterUpdateTicketRowInput,
    | "tk_priority"
    | "tk_risk_level"
    | "tk_approval_step_id"
    | "tk_assignee_usernames"
  >,
): RequesterUpdateTicketRowInput {
  return {
    ...state,
    tk_category_id: Number(input.categoryId),
    tk_subject: input.subject.trim(),
    tk_content: input.content.trim(),
    tk_due_at: toIsoDateString(input.dueAt),
    tk_email: normalizeTicketEmail(input.email),
    tk_files: normalizeTicketAttachmentMetadata(input.files),
    tk_images: normalizeTicketAttachmentMetadata(input.images),
  };
}

function toIsoDateString(value: Date | string): ISODateString {
  return (value instanceof Date ? value : new Date(value)).toISOString();
}
