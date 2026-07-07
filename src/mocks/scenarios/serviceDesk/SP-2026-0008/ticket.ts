import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  tk_id: "ff63d3c6-5e72-473c-b0a1-af1ea5adf938",
  tk_ticket_no: "SP-2026-0008",
  tk_created_at: "2026-06-25T07:13:53Z",
  tk_updated_at: "2026-06-26T01:18:10Z",
  tk_requester_username: "vivian_long",
  tk_status: "Pending",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["matthew_williams", "amelia_brown", "evan_seo"],
  tk_work_minutes: 0,
  tka_last_comment_at: null,
  tka_last_comment_email: null,

  tka_last_user_activity_at: "2026-06-26T01:17:18Z",
  tka_last_user_activity_email: "Amelia.Brown@sunghwan-portal.dev",
  tk_due_at: "2026-07-01T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "62",
  cat_name: {
    en: "Work log / attendance issue",
    es: "Problema de registro laboral / asistencia",
    fr: "Problème de pointage / présence",
    ko: "근무 일지 / 출근 문제",
  },
  tk_approval_step_id: null,
  tk_subject: "Please reflect the overtime work on the 24th in the work log",
  tk_content:
    "Hello. On the 24th, after all employees left at 5:00 PM, the Facilities Team performed electrical wiring replacement work.<br>Due to this, we were unable to check out.<br>Please update the departure and working hours for three employees.<br><br>Jasper.Powell@sunghwan-portal.dev<br>Naomi.Jenkins@sunghwan-portal.dev<br>Connor.Peterson@sunghwan-portal.dev<br><br>Work end time: 9:00 PM.",
  tk_email: {
    to: [
      "Matthew.Williams@sunghwan-portal.dev",
      "Amelia.Brown@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
    ],
    cc: [
      "Jasper.Powell@sunghwan-portal.dev",
      "Naomi.Jenkins@sunghwan-portal.dev",
      "Connor.Peterson@sunghwan-portal.dev",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
