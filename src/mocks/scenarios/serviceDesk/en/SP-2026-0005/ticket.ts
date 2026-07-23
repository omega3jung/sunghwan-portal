import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "c258e885-c9ea-4594-8cec-e1ba39696260",
  tk_ticket_no: "SP-2026-0005",
  tk_created_at: "2026-07-05T06:03:14Z",
  tk_updated_at: "2026-07-05T07:21:42Z",
  tk_requester_username: "grant_murphy",
  tk_requester: {
    username: "grant_murphy",
    name: {
      en: { first: "Grant", middle: "", last: "Murphy" },
    },
    email: "Grant.Murphy@sunghwan-portal.dev",
    image: null,
  },
  tk_status: "Resolved",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_work_minutes: 105,
  tka_last_comment_at: "2026-07-05T07:21:42Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-05T07:21:42Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
  tk_due_at: "2026-07-06T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "5",
  cat_name: {
    en: "Performance / Availability",
    es: "Rendimiento / disponibilidad",
    fr: "Performance / disponibilité",
    ko: "성능 / 사용성",
  },
  tk_approval_step_id: null,
  tk_subject: "Outbound shipping screen stuck on loading",
  tk_content:
    "While processing outbound shipments, the shipping execution screen keeps showing only the loading icon and never completes.<br>Users in logistics cannot finish outbound shipping transactions.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["Victor.Rivera@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
