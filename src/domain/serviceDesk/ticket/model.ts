import { ISODateString } from "@/shared/types/date";
import { ImageValueLabel } from "@/shared/types/options";

import { Attach } from "../types";
import { Status, TicketPeriod } from "../types/enums";

// read only ticket info.
interface TicketSystemBase {
  // ticket info.
  id: string;
  createdDate: ISODateString;

  // requester info.
  requester: { id: string; email: string; name: string; imageUrl: string };
}

// editable ticket info.
interface TicketEditable {
  // ticket info.
  categoryId: string;
  subCategoryId: string;
  approvalStepId: string;
  subject: string;
  body: string;
  emails: {
    to: string[];
    cc: string[];
    bcc: string[];
  };
  files: Attach[];
  images: Attach[];
}

interface TicketProcessState {
  // processed history.
  status: Status;
  priority: TicketPeriod;
  assignee: string[];
  lastCommentTime: ISODateString;
  lastCommenterEmail: string;
  trackTime: number;
}

export interface TicketSummary extends TicketSystemBase, TicketProcessState {
  category: string;
  subCategory: string;
  approvalStep: string;
  subject: string;
  dueDate: ISODateString;

  age: number;
  owner: boolean;
  assigned: boolean;
  active: boolean; // no removing tickets, leave it as history.
}

export interface TicketDetail
  extends TicketSystemBase, TicketEditable, TicketProcessState {
  dueDate: ISODateString;

  owner: boolean;
  assigned: boolean;
  active: boolean; // no removing tickets, leave it as history.
}

export interface Reply {
  ticketId: string;
  id: string;
  body: string;

  owner: { id: string; email: string; name: string; imageUrl: string };

  createdDate: ISODateString;
  private: boolean;
  active: boolean;
  files: Attach[];
  images: Attach[];
}

export interface TrackTime {
  ticketId: string;
  assignee: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  };
  time: number;
}

export interface History {
  ticketId: string;
  replyId: string;
  id: string;
  approvalStep: string;
  Type: string;
  user: ImageValueLabel[];
  date: ISODateString;
  note: string;
  active: boolean;
}
