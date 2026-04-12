import { DbTicketComment } from "@/api/serviceDesk/ticket/comment";

import { ticket } from "./ticket";

export const comments: DbTicketComment[] = [
  {
    ticket_id: ticket.id,
    comment_no: 1,

    body: "Hello, Liam.<br>Please note that this request may take up to 3 days based on the SLA.<br>We need to check the printer setup and validate the label output.",
    owner_id: "41",

    visibility: "public",

    created_at: "2026-03-27T01:23:18Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 2,

    body: "Got it. Just let me know after you finished",
    owner_id: "53",

    visibility: "public",

    created_at: "2026-03-27T01:40:42Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 3,

    body: "Hello. Mason Kwon, Could you set a printer to repair team and check it printing correctly?<br>I finished set this barcode up to system and checked it's printing out through PDF file.",
    owner_id: "41",

    visibility: "public",

    created_at: "2026-03-30T01:12:20Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 4,

    body: "Hello.<br><br>The barcode itself is correct, but the label width is too small,<br>causing the right side to be cut off during printing.<br><br>I have ordered wider labels and will update once received.",
    owner_id: "43",

    visibility: "public",

    created_at: "2026-03-30T01:48:10Z",
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
