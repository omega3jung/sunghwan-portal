import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { ticket } from "./ticket";

export const actions: DbTicketAction[] = [
  {
    ticket_id: ticket.id,
    action_no: 1,

    action_type: "COMMENT",
    content:
      "Hello, Liam.<br>I couldn't find 84321565 in the system. Could you check the device ID is correct?<br> Thank you.",
    owner_id: "evan_seo",

    created_at: "2026-03-27T09:15:00Z",
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
      "84321565 is correct. Please check the screenshot.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
    owner_id: "liam_williams",

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
    action_no: 3,

    action_type: "COMMENT",
    content:
      "It was ' 84321565'. There is blank before 84321565.<br> I updated the device ID to 84321585.<br> Thanks and regards.",
    owner_id: "evan_seo",

    created_at: "2026-03-27T14:36:47Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
  {
    ticket_id: ticket.id,
    action_no: 4,

    action_type: "COMMENT",
    content: "Thank you!!",
    owner_id: "liam_williams",

    created_at: "2026-03-27T15:02:13Z",
    updated_at: null,
    active: true,

    files: [],
    images: [],
  },
];
