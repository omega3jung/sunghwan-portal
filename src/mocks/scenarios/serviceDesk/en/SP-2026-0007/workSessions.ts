import { DbTicketWorkSession } from "@/feature/serviceDesk/ticketWorkSession/api";

export const workSessions: DbTicketWorkSession[] = [
  {
    work_session_no: 1,
    ticket_id: "68fdd7e0-8716-4e78-bb1c-3dcd11583e80",
    assignee_username: "julian_moon",
    start_at: null,
    end_at: "2026-07-07T02:04:30Z",
    duration_minutes: 65,
    note: null,
    created_at: "2026-07-07T02:04:30Z",
    updated_at: null,
  },
  {
    work_session_no: 2,
    ticket_id: "68fdd7e0-8716-4e78-bb1c-3dcd11583e80",
    assignee_username: "matthew_williams",
    start_at: null,
    end_at: "2026-07-07T02:35:00Z",
    duration_minutes: 20,
    note: null,
    created_at: "2026-07-07T02:35:00Z",
    updated_at: null,
  },
];
