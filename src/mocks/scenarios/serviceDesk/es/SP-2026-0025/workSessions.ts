import { DbTicketWorkSession } from "@/feature/serviceDesk/ticketWorkSession/api";

export const workSessions: DbTicketWorkSession[] = [
  {
    work_session_no: 1,
    ticket_id: "5604da0d-48b7-43ce-9155-587687d957ef",
    assignee_username: "evan_seo",
    start_at: null,
    end_at: "2026-07-05T06:20:00Z",
    duration_minutes: 30,
    note: null,
    created_at: "2026-07-05T06:20:00Z",
    updated_at: null,
  },
  {
    work_session_no: 2,
    ticket_id: "5604da0d-48b7-43ce-9155-587687d957ef",
    assignee_username: "daniel_kim",
    start_at: null,
    end_at: "2026-07-05T07:21:30Z",
    duration_minutes: 75,
    note: null,
    created_at: "2026-07-05T07:21:30Z",
    updated_at: null,
  },
];
