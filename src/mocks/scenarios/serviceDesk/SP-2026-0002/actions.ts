import { TICKET_ACTION_MOCK_DEFAULTS, TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    ...TICKET_ACTION_MOCK_DEFAULTS,
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hi, isabella. Could you give an details what info should be include?",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T08:20:00Z",
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
      "It should have receive ID, receive date, IMEI, SKU, employee ID, status and current location.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-05-27T08:41:12Z",
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
    tka_content:
      "Here's the report. If you need any help, please let us know. Thank you.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-05-27T09:15:11Z",
    tka_updated_at: null,
    tka_active: true,

    tka_files: [
      {
        index: 1,
        type: "file",
        name: "report_2026_03_27.csv",
        url: "/_mocks/scenarios/serviceDesk/ticket-2026-2/comment-3_file-1.csv",
        active: true,
      },
    ],
    tka_images: [],
  },
];
