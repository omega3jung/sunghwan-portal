import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "169affc1-d0c8-4101-9697-85ef4f497694",
  tk_ticket_no: "SP-2026-0007",
  tk_created_at: "2026-06-24T01:13:27Z",
  tk_updated_at: "2026-06-24T01:18:10Z",
  tk_requester_username: "__demo_user__",
  tk_status: "Assigned",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_admin__", "__demo_manager__"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-06-24T01:18:10Z",
  tka_last_user_activity_email: null,
  tk_due_at: "2026-06-30T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "92",
  cat_name: {
    en: "General inquiry",
    es: "Consulta general",
    fr: "Demande générale",
    ko: "일반 문의",
  },
  tk_approval_step_id: null,
  tk_subject: "Assigned ticket auto-start test",
  tk_content:
    "This ticket is prepared for testing the automatic status update flow.<br>When the assignee opens the ticket detail view while the ticket status is 'Assigned', the status should automatically change to 'Working'.",
  tk_email: {
    to: ["demoAdmin@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoManager@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
