import { DbTicketWorkSession } from "@/feature/serviceDesk/ticketWorkSession/api";

export const workSessions: DbTicketWorkSession[] = [
  {
    work_session_no: 1,
    ticket_id: "7fc8bf8d-9d4c-4bfa-89d1-adaeed203ae3",
    assignee_username: "evan_seo",
    start_at: null,
    end_at: "2026-07-04T17:06:38Z",
    duration_minutes: 35,
    note: null,
    created_at: "2026-07-04T17:06:38Z",
    updated_at: null,
  },
  {
    work_session_no: 2,
    ticket_id: "7fc8bf8d-9d4c-4bfa-89d1-adaeed203ae3",
    assignee_username: "daniel_kim",
    start_at: null,
    end_at: "2026-07-05T03:22:40Z",
    duration_minutes: 60,
    note: null,
    created_at: "2026-07-05T03:22:40Z",
    updated_at: null,
  },
];
