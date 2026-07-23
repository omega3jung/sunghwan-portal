import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "6f5a5a2c-4fc9-493d-b1a9-457b51b9abef",
  tk_ticket_no: "SP-2026-0014",
  tk_created_at: "2026-07-14T01:13:27Z",
  tk_updated_at: "2026-07-14T01:18:10Z",
  tk_requester_username: "__demo_user__",
  tk_requester: {
    username: "__demo_user__",
    name: {
      en: { first: "Demo", middle: "", last: "User" },
    },
    email: "demoUser@sunghwan-portal.dev",
    image: null,
  },
  tk_status: "Assigned",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["__demo_admin__", "__demo_manager__"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-07-14T01:18:10Z",
  tka_last_user_activity_email: null,
  tk_due_at: "2026-07-18T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "85",
  cat_name: {
    en: "Client issue inquiry",
    es: "Consulta sobre problemas del cliente",
    fr: "Demande concernant un problème client",
    ko: "고객사 문제 문의",
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
