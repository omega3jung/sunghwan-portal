import { Priority } from "@/domain/common";
import { ISODateString } from "@/shared/types/date";
import { ImageValueLabel } from "@/shared/types/options";

import { Attach } from "../types";
import { CommentVisibility, TicketStatus } from "../types/enums";

// read only ticket info.
interface TicketSystemBase {
  // ticket info.
  id: string;
  ticketNumber: string;
  createdDate: ISODateString;
  updatedDate: ISODateString;

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
  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };
  files: Attach[];
  images: Attach[];
}

interface TicketProcessState {
  // processed history.
  status: TicketStatus;
  priority: Priority;
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

export interface Comment {
  ticketId: string;
  id: string;
  body: string;

  owner: { id: string; email: string; name: string; imageUrl: string };

  visibility: CommentVisibility;

  createdDate: ISODateString;
  updatedDate: ISODateString;
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
