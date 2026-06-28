import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hello, Liam.<br>Please note that this request may take up to 3 days based on the SLA.<br>We need to check the printer setup and validate the label output.",
    owner_id: "evan_seo",

    created_at: "2026-05-27T01:23:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 2,

    action_type: "COMMENT",
    content: "Got it. Just let me know after you finished",
    owner_id: "liam_williams",

    created_at: "2026-05-27T01:40:42Z",
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
      "Hello. Mason Kwon, Could you set a printer to repair team and check it printing correctly?<br>I finished set this barcode up to system and checked it's printing out through PDF file.",
    owner_id: "evan_seo",

    created_at: "2026-05-30T01:12:20Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "NOTE",
    content:
      "Hello.<br><br>The barcode itself is correct, but the label width is too small,<br>causing the right side to be cut off during printing.<br><br>I have ordered wider labels and will update once received.",
    owner_id: "mason_kwon",

    created_at: "2026-05-30T01:48:10Z",
    updated_at: null,
    active: true,

    files: [],
    images: [
      {
        index: 1,
        type: "image",
        name: "comment-4_image-1.png",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-3/comment-4_image-1.png",
        active: true,
      },
    ],
  },
];
