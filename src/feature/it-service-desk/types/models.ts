import { ImageValueLabel } from "@/types";

import { AttachFile, Priority, Status } from "./enums";

// back-end data structure.
export type Client = {
  client_id: string;
  client_name: string;
  color: string;
};

// front-end data structure.
export type FullCategories = Client & { category: MainCategory[] };

export interface Category {
  category_id: string; // toString(number). can use parseInt.
  category_index: number;
  category_name: string;
  category_description: string;
  category_agent: Array<User>;
  category_disabled: boolean;
}

export type MainCategory = Category & {
  sub_category: Category[];
};

export interface ApprovalStep {
  category_id: string; // toString(number). can use parseInt.
  step_seq: number;
  step_desc: string;
  step_approver: Array<User>;
  step_disabled: boolean;
}

export interface AssignmentRule {
  category_id: string; // toString(number). can use parseInt.
  rule_seq: number;
  rule_description: string;
  rule_assignee: Array<User>;
  rule_disabled: boolean;
}

export interface User {
  user_type: string;
  user_id: number;
  user_name: string;
  user_email: string;
  user_image_url: string;
  user_dept: number;
  user_disabled: boolean;
}

export interface Ticket {
  // ticket info.
  ticket_id: number;
  ticket_category: string;
  ticket_category_id: number;
  ticket_sub_category: string;
  ticket_sub_category_id: number;
  ticket_step: string;
  ticket_step_id: number;
  ticket_subject: string;
  ticket_body: string;
  ticket_created_date: Date;
  ticket_due_date: Date;
  ticket_email_bcc: Array<string>;
  ticket_email_cc: Array<string>;
  ticket_email_to: Array<string>;
  ticket_file_list: Attach[];
  ticket_image_list: Attach[];

  // requester info.
  ticket_requester_e_id: number;
  ticket_requester_email: string;
  ticket_requester_name: string;
  ticket_requester_image_url: string;

  // processed history.
  ticket_status: Status;
  ticket_assignee: Array<User>;
  ticket_priority: Priority;
  ticket_age: number;
  ticket_last_comment_time: Date;
  ticket_last_commenter_email: string;
  ticket_track_time: number;

  // flag.
  ticket_owner: boolean;
  ticket_assigned: boolean;
  ticket_disabled: boolean; // no removing tickets, leave it as history.
}

export interface Reply {
  ticket_id: number;
  reply_id: number;
  reply_body: string;

  reply_owner_id: number;
  reply_owner_email: string;
  reply_owner_name: string;
  reply_owner_image_url: string;

  reply_created_date: Date;
  reply_private: boolean;
  reply_disabled: boolean;
  reply_file_list: Attach[];
  reply_image_list: Attach[];
}

export interface Attach {
  file_index: number;
  file_type: AttachFile;
  file_name: string;
  file_url: string;
  file_dis: boolean;
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
  history_date: Date;
  history_note: string;
  history_dis: boolean;
}
