import { TicketActionMockInput } from "../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,

    tka_action_type: "COMMENT",
    tka_content:
      "Hello, Grant.<br>We are checking the transaction flow now.<br>Please confirm whether this affects only one user or the whole logistics team.",
    tka_owner_username: "evan_seo",

    tka_created_at: "2026-06-02T06:15:48Z",
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
      "This affects the whole outbound shipping team.<br>Different users tried it and all of them are stuck with the loading spinner.",
    tka_owner_username: "grant_murphy",

    tka_created_at: "2026-06-02T06:19:36Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,

    tka_action_type: "NOTE",
    tka_content:
      "Found the root cause.<br>A DB lock on the shipping transaction path is blocking requests from completing.<br>I am clearing the blocked session and verifying that pending transactions recover normally.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-02T06:52:08Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,

    tka_action_no: 4,

    tka_action_type: "COMMENT",
    tka_content:
      "Update: the DB lock has been resolved and outbound shipping is processing normally again.<br>Please refresh the page and retry the transaction.<br>No additional data correction is required on our side.",
    tka_owner_username: "daniel_kim",

    tka_created_at: "2026-06-02T07:21:42Z",
    tka_updated_at: null,
    tka_active: true,

    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
