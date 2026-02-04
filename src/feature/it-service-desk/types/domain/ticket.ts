import { ImageValueLabel, ISODateString } from "@/types";

import { Priority, Status } from "../enums";
import { Attach, User } from "../shared";

type Assignee = User;

// read only ticket info.
interface TicketSystemBase {
  // ticket info.
  ticket_id: number;
  ticket_created_date: ISODateString;

  // requester info.
  ticket_requester_e_id: number;
  ticket_requester_email: string;
  ticket_requester_name: string;
  ticket_requester_image_url: string;
}

// editable ticket info.
interface TicketEditable {
  // ticket info.
  ticket_category_id: number;
  ticket_sub_category_id: number;
  ticket_step_id: number;
  ticket_subject: string;
  ticket_body: string;
  ticket_email_bcc: string[];
  ticket_email_cc: string[];
  ticket_email_to: string[];
  ticket_file_list: Attach[];
  ticket_image_list: Attach[];
}

interface TicketProcessState {
  // processed history.
  ticket_status: Status;
  ticket_priority: Priority;
  ticket_assignee: Assignee[];
  ticket_last_comment_time: Date;
  ticket_last_commenter_email: string;
  ticket_track_time: number;
}

export interface TicketListItem extends TicketSystemBase, TicketProcessState {
  ticket_category: string;
  ticket_sub_category: string;
  ticket_step: string;
  ticket_subject: string;
  ticket_due_date: Date;

  ticket_age: number;
  ticket_owner: boolean;
  ticket_assigned: boolean;
  ticket_active: boolean; // no removing tickets, leave it as history.
}

export interface TicketDetail
  extends TicketSystemBase, TicketEditable, TicketProcessState {
  ticket_step_id: number;
  ticket_due_date: Date;
  ticket_file_list: Attach[];
  ticket_image_list: Attach[];

  ticket_owner: boolean;
  ticket_assigned: boolean;
  ticket_active: boolean; // no removing tickets, leave it as history.
}

export interface Reply {
  ticket_id: number;
  reply_id: number;
  reply_body: string;

  reply_owner_id: number;
  reply_owner_email: string;
  reply_owner_name: string;
  reply_owner_image_url: string;

  reply_created_date: ISODateString;
  reply_private: boolean;
  reply_active: boolean;
  reply_file_list: Attach[];
  reply_image_list: Attach[];
}

export interface TrackTime {
  ticket_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_image_url: string;
  track_time: number;
}

export interface History {
  ticket_id: number;
  reply_id: number;
  history_id: number;
  history_step: number;
  history_type: string;
  history_user: ImageValueLabel[];
  history_date: ISODateString;
  history_note: string;
  history_dis: boolean;
}
