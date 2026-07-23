import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "8785f77b-da97-4afd-a76f-ba6f37839c88",
  tk_ticket_no: "SP-2026-0006",
  tk_created_at: "2026-07-06T06:13:27Z",
  tk_updated_at: "2026-07-06T07:13:18Z",
  tk_requester_username: "liam_williams",
  tk_requester: {
    username: "liam_williams",
    name: {
      en: { first: "Liam", middle: "", last: "Williams" },
    },
    email: "liam.williams@sunghwan-portal.dev",
    image: null,
  },
  tk_status: "Closed",
  tk_close_reason: "Merged",
  tk_priority: "high",
  tk_risk_level: "high",
  tk_assignee_usernames: ["evan_seo", "daniel_kim"],
  tk_merged_into_ticket_id: "c258e885-c9ea-4594-8cec-e1ba39696260",
  tk_merged_into_ticket_no: "SP-2026-0005",
  tk_work_minutes: 20,
  tka_last_comment_at: "2026-07-06T07:13:18Z",
  tka_last_comment_email: "Daniel.Kim@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-06T07:13:18Z",
  tka_last_user_activity_email: "Daniel.Kim@sunghwan-portal.dev",
  tk_due_at: "2026-07-07T18:00:00Z",
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
  tk_subject: "Receiving, repair, and QC screens stuck on loading",
  tk_content:
    "Users in receiving, repair, and QC are seeing only the loading spinner and cannot proceed with transactions.<br>The issue appears across multiple steps in the portal, not only in one screen.",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["olivia.johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
