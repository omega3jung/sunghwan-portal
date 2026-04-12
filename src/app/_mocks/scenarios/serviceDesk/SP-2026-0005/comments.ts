import { DbTicketComment } from "@/api/serviceDesk/ticket/comment";

import { ticket } from "./ticket";

export const comments: DbTicketComment[] = [
  {
    ticket_id: ticket.id,
    comment_no: 1,

    body: "Hello, Olivia.<br>Thank you for submitting this request directly. Since it was raised by a repair team manager, no additional approval step is needed.<br>We are reviewing the access impact with the IT team because Unit ID is used as a core identifier across downstream records.",
    owner_id: "41",

    visibility: "public",

    created_at: "2026-03-31T17:02:41Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 2,

    body: "Hi, Daniel.<br>Could you assist this ticket?<br>They want to grant edit permission to Repair Technician, employee group.",
    owner_id: "41",

    visibility: "internal",

    created_at: "2026-03-31T17:06:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 3,

    body: "Reviewed from IT governance perspective.<br>Unit ID is a critical identifier and should remain restricted to controlled roles.<br>Expanding edit permission to general repair users would increase the risk of data inconsistency and make audit tracing difficult when corrections are made later.",
    owner_id: "31",

    visibility: "internal",

    created_at: "2026-04-01T01:26:17Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 4,

    body: "Hello, Olivia.<br>After review, I am rejecting this request.<br><br>Reason:<br>Unit ID modification is restricted to maintain data integrity and auditability.<br><br>Recommendation:<br>Please escalate correction requests through team leader for validation.",
    owner_id: "31",

    visibility: "public",

    created_at: "2026-04-01T03:22:49Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
