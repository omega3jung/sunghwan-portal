import { DbTicketComment } from "@/api/serviceDesk/ticket/comment";

import { ticket } from "./ticket";

export const comments: DbTicketComment[] = [
  {
    ticket_id: ticket.id,
    comment_no: 1,

    body: "Hello, Liam.<br>I couldn't find 84321565 in the system. Could you check the device ID is correct?<br> Thank you.",
    owner_id: "41",

    visibility: "public",

    created_at: "2026-03-27T09:15:00Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 2,

    body: "84321565 is correct. Please check the screenshot.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
    owner_id: "53",

    visibility: "public",

    created_at: "2026-03-27T12:55:58Z",
    updated_at: null,
    active: true,

    files: [],
    images: [
      {
        index: 1,
        type: "image",
        name: "comment-2_image-1.png",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png",
        active: true,
      },
    ],
  },
  {
    ticket_id: ticket.id,
    comment_no: 3,

    body: "It was ' 84321565'. There is blank before 84321565.<br> I updated the device ID to 84321585.<br> Thanks and regards.",
    owner_id: "41",

    visibility: "public",

    created_at: "2026-03-27T14:36:47Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    comment_no: 4,

    body: "Thank you!!",
    owner_id: "53",

    visibility: "public",

    created_at: "2026-03-27T15:02:13Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
