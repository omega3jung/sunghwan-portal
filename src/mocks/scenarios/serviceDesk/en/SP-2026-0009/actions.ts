import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "APPROVE",
    tka_content: "Elias Martinez approved the request.",
    tka_owner_username: "elias_martinez",
    tka_created_at: "2026-07-09T08:29:25Z",
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
      "Hello, Fiona and Elias.<br>The shipping invoice cannot be sent because this device is in the QC area. Please transfer the device to the shipping dock and try again.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T09:15:53Z",
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
      "Wait, Evan. A manager at Demo Corporation asked us to complete this today. Please expedite the request.",
    tka_owner_username: "fiona_tanaka",
    tka_created_at: "2026-07-09T10:01:58Z",
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
      "Understood, Fiona. I will move device 357849216854353 to the shipping dock and process it.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T10:17:18Z",
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
    tka_content:
      "We confirmed that the shipping invoice for device 357849216854353 was sent. Please verify the result and proceed with the next steps.",
    tka_owner_username: "evan_seo",
    tka_created_at: "2026-07-09T12:43:05Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
];
