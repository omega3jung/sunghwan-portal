import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "2d00f528-43af-47dd-90e0-72bd5eac6bb1",
  tk_ticket_no: "SP-2026-0015",
  tk_created_at: "2026-07-15T01:13:27Z",
  tk_updated_at: "2026-07-15T01:13:28Z",
  tk_requester_username: "__demo_user__",
  tk_status: "Approval",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_manager__"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-07-15T01:13:27Z",
  tka_last_user_activity_email: "demoUser@sunghwan-portal.dev",
  tk_due_at: "2026-07-19T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "85",
  cat_name: {
    en: "Client issue inquiry",
    es: "Consulta sobre problemas del cliente",
    fr: "Demande concernant un problème client",
    ko: "고객사 문제 문의",
  },
  tk_approval_step_id: "9",
  tk_subject: "Approve and decline action test",
  tk_content:
    "This ticket is prepared for testing the Approve and Decline actions.<br>The current approver should be able to approve or decline the ticket while it is in the 'Approval' status.",
  tk_email: {
    to: ["demoManager@sunghwan-portal.dev"],
    cc: ["demoUser@sunghwan-portal.dev", "demoAdmin@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
