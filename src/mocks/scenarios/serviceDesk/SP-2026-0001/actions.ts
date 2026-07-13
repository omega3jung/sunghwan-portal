import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson approved",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-05-27T08:48:37Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "COMMENT",
    tka_content:
      "Hello, Liam.<br>I couldn't find 84321565 in the system. Could you check the device ID is correct?<br> Thank you.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T09:15:00Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content:
      "84321565 is correct. Please check the screenshot.<br><img src='/_mocks/scenarios/serviceDesk/ticket-2026-1/comment-2_image-1.png' />",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T12:55:58Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [
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
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "It was ' 84321565'. There is blank before 84321565.<br> I updated the device ID to 84321585.<br> Thanks and regards.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T14:36:47Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "COMMENT",
    tka_content: "Thank you!!",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T15:02:13Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
