import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hello, Liam.<br>We are checking this issue with the backend team now.<br>Please confirm which process steps are blocked for the repair team.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-07-06T06:22:11Z",
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
      "Receiving, repair, and QC are all blocked.<br>Every affected screen keeps showing only the loading icon and users cannot continue.",
    tka_owner_username: "liam_williams",

    tka_created_at: "2026-07-06T06:25:44Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "MERGE",
    tka_content:
      "This ticket has been merged into SP-2026-0005 because it is the same incident caused by the same DB lock.<br>Further tracking and communication will continue in the representative ticket.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-07-06T07:13:18Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
