import { DbTicketWorkSession } from "@/feature/serviceDesk/ticketWorkSession/api";

export const workSessions: DbTicketWorkSession[] = [
  {
    work_session_no: 1,
    ticket_id: "aef262d0-46f8-43f0-b1bc-e686377a8b16",
    assignee_username: "evan_seo",
    start_at: null,
    end_at: "2026-07-06T06:26:00Z",
    duration_minutes: 10,
    note: null,
    created_at: "2026-07-06T06:26:00Z",
    updated_at: null,
  },
  {
    work_session_no: 2,
    ticket_id: "aef262d0-46f8-43f0-b1bc-e686377a8b16",
    assignee_username: "daniel_kim",
    start_at: null,
    end_at: "2026-07-06T07:13:10Z",
    duration_minutes: 10,
    note: null,
    created_at: "2026-07-06T07:13:10Z",
    updated_at: null,
  },
];
