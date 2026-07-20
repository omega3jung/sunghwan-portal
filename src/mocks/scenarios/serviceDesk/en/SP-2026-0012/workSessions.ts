import { DbTicketWorkSession } from "@/feature/serviceDesk/ticketWorkSession/api";

export const workSessions: DbTicketWorkSession[] = [
  {
    work_session_no: 1,
    ticket_id: "0010f1ee-c20f-4a39-933f-3c3d89d6661b",
    assignee_username: "adrian_vega",
    start_at: null,
    end_at: "2026-07-12T05:54:50Z",
    duration_minutes: 18,
    note: null,
    created_at: "2026-07-12T05:54:50Z",
    updated_at: null,
  },
  {
    work_session_no: 2,
    ticket_id: "0010f1ee-c20f-4a39-933f-3c3d89d6661b",
    assignee_username: "bianca_davis",
    start_at: null,
    end_at: "2026-07-12T08:18:24Z",
    duration_minutes: 120,
    note: null,
    created_at: "2026-07-12T08:18:24Z",
    updated_at: null,
  },
];
