import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "APPROVE",
    tka_content: "Olivia Johnson approved",
    tka_owner_username: "olivia_johnson",

    tka_created_at: "2026-05-27T01:20:05Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,

    tka_action_type: "COMMENT",
    tka_content:
      "Hello, Liam.<br>Please note that this request may take up to 3 days based on the SLA.<br>We need to check the printer setup and validate the label output.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T01:23:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "COMMENT",
    tka_content: "Got it. Just let me know after you finished",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T01:40:42Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "Hello. Mason Kwon, Could you set a printer to repair team and check it printing correctly?<br>I finished set this barcode up to system and checked it's printing out through PDF file.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-30T01:12:20Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [],
  },
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,

    tka_action_type: "NOTE",
    tka_content:
      "Hello.<br><br>The barcode itself is correct, but the label width is too small,<br>causing the right side to be cut off during printing.<br><br>I have ordered wider labels and will update once received.",
    tka_owner_username: "mason_kwon",

    tka_created_at: "2026-05-30T01:48:10Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [],
    tka_images: [
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
