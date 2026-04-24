import { DbTicketAction } from "@/feature/serviceDesk/ticketAction";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hi, isabella. Could you give an details what info should be include?",
    owner_id: "41",

    created_at: "2026-03-27T08:20:00Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "COMMENT",
    content:
      "It should have receive ID, receive date, IMEI, SKU, employee ID, status and current location.",
    owner_id: "53",

    created_at: "2026-03-27T08:41:12Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 3,

    action_type: "COMMENT",
    content:
      "Here's the report. If you need any help, please let us know. Thank you.",
    owner_id: "41",

    created_at: "2026-03-27T09:15:11Z",
    updated_at: null,
    active: true,

    files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-2/comment-3_file-1.csv",
        active: true,
      },
    ],
    images: [],
  },
];
