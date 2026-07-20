import { DbTicketWorkSession } from "@/feature/serviceDesk/ticketWorkSession/api";

export const workSessions: DbTicketWorkSession[] = [
  {
    work_session_no: 1,
    ticket_id: "a39a5741-6190-4f56-bd6f-1a5449230f6c",
    assignee_username: "evan_seo",
    start_at: null,
    end_at: "2026-07-06T01:12:40Z",
    duration_minutes: 50,
    note: null,
    created_at: "2026-07-06T01:12:40Z",
    updated_at: null,
  },
  {
    work_session_no: 2,
    ticket_id: "a39a5741-6190-4f56-bd6f-1a5449230f6c",
    assignee_username: "mason_kwon",
    start_at: null,
    end_at: "2026-07-06T01:48:30Z",
    duration_minutes: 30,
    note: null,
    created_at: "2026-07-06T01:48:30Z",
    updated_at: null,
  },
];
