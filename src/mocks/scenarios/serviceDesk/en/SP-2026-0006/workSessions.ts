import { DbTicketWorkSession } from "@/feature/serviceDesk/ticketWorkSession/api";

export const workSessions: DbTicketWorkSession[] = [
  {
    work_session_no: 1,
    ticket_id: "8785f77b-da97-4afd-a76f-ba6f37839c88",
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
    ticket_id: "8785f77b-da97-4afd-a76f-ba6f37839c88",
    assignee_username: "daniel_kim",
    start_at: null,
    end_at: "2026-07-06T07:13:10Z",
    duration_minutes: 10,
    note: null,
    created_at: "2026-07-06T07:13:10Z",
    updated_at: null,
  },
];
