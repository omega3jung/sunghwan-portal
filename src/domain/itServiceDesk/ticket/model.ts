import { ISODateString } from "@/shared/types/date";
import { ImageValueLabel } from "@/shared/types/options";

import { Attach, ItServiceDeskUser } from "../types";
import { Priority, Status } from "../types/enums";

type Assignee = ItServiceDeskUser;

// read only ticket info.
interface TicketSystemBase {
  // ticket info.
  id: number;
  createdDate: ISODateString;

  // requester info.
  requester: { Id: number; email: string; name: string; imageUrl: string };
}

// editable ticket info.
interface TicketEditable {
  // ticket info.
  categoryId: number;
  subCategoryId: number;
  approvalStepId: number;
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
  priority: Priority;
  assignee: Assignee[];
  lastCommentTime: Date;
  lastCommenterEmail: string;
  trackTime: number;
}

export interface TicketListItem extends TicketSystemBase, TicketProcessState {
  category: string;
  subCategory: string;
  approvalStep: string;
  subject: string;
  dueDate: Date;

  age: number;
  owner: boolean;
  assigned: boolean;
  active: boolean; // no removing tickets, leave it as history.
}

export interface TicketDetail
  extends TicketSystemBase, TicketEditable, TicketProcessState {
  approvalStepId: number;
  dueDate: Date;
  files: Attach[];
  images: Attach[];

  owner: boolean;
  assigned: boolean;
  active: boolean; // no removing tickets, leave it as history.
}

export interface Reply {
  ticketId: number;
  id: number;
  body: string;

  owner: { id: number; email: string; name: string; imageUrl: string };

  createdDate: ISODateString;
  private: boolean;
  active: boolean;
  files: Attach[];
  images: Attach[];
}

export interface TrackTime {
  ticketId: number;
  assignee: {
    id: number;
    name: string;
    email: string;
    imageUrl: string;
  };
  time: number;
}

export interface History {
  ticketId: number;
  replyId: number;
  id: number;
  approvalStep: number;
  Type: string;
  user: ImageValueLabel[];
  date: ISODateString;
  note: string;
  active: boolean;
}
