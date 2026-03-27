import { DbTicketDetail } from "@/api/serviceDesk/ticket";

export const internalTicketsMock: DbTicketDetail[] = [
  {
    id: "sunghwan-portal-2026-1",
    ticket_number: "SP-2026-0001",
    created_at: "2026-03-26T22:44:33Z",
    updated_at: "2026-03-27T09:15:00Z",
    requester_id: "53",
    status: "Working",
    priority: "medium",
    assignee_id: ["41"],
    track_time_minutes: 18,
    last_comment_at: "2026-03-27T09:15:00Z",
    last_commenter_email: "liam.williams@sunghwan-portal.dev",
    due_at: "2026-04-02T18:00:00Z",
    owner: false,
    assigned: false,
    active: true,
    scope: "INTERNAL",
    category_id: "72",
    approval_step_id: null,
    subject: "Request to correct a received device ID",
    body: "Hi, we found that one of the received B4 device IDs is incorrect. Please update the device ID from 84321565 to 84321585.",
    email: {
      to: ["Evan.Seo@sunghwan-portal.dev", "liam.williams@sunghwan-portal.dev"],
      cc: [
        "olivia.johnson@sunghwan-portal.dev",
        "emma.brown@sunghwan-portal.dev",
      ],
      bcc: [],
    },
    files: [],
    images: [],
  },
];
