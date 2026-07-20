import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "6326745b-d8ea-4063-ac19-0f14f8636fe4",
  tk_ticket_no: "SP-2026-0012",
  tk_created_at: "2026-07-12T05:46:12Z",
  tk_updated_at: "2026-07-13T08:20:34Z",
  tk_requester_username: "tessa_ito",
  tk_status: "Closed",
  tk_close_reason: "Escalated",
  tk_priority: "high",
  tk_risk_level: "medium",
  tk_assignee_usernames: ["adrian_vega", "bianca_davis"],
  tk_merged_into_ticket_id: "a92eed5f-b295-4224-8d26-0c14f79435f3",
  tk_merged_into_ticket_no: "SP-2026-0013",
  tk_work_minutes: 138,
  tka_last_comment_at: "2026-07-13T08:20:34Z",
  tka_last_comment_email: "bianca.davis@client-demo-energy.com",
  tka_last_user_activity_at: "2026-07-13T08:20:34Z",
  tka_last_user_activity_email: "bianca.davis@client-demo-energy.com",
  tk_due_at: "2026-07-15T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "189",
  cat_name: {
    en: "Report data issue",
    es: "Problema de datos en reportes",
    fr: "Problème de données de rapport",
    ko: "리포트 데이터 문제",
  },
  tk_approval_step_id: null,
  tk_subject:
    "Internal Review Request for Delayed Solar Farm A Generation Data Updates",
  tk_content:
    "Hello. Generation data for Solar Farm A on the Energy Operations Dashboard has not been updated since June 29, 2026, at 14:35.<br><br>The latest generation data is available in the external monitoring system, so please first check the internal telemetry collection and report data processing pipeline for issues. This is affecting the operational status and daily generation reports.",
  tk_email: {
    to: [
      "adrian.vega@client-demo-energy.com",
      "bianca.davis@client-demo-energy.com",
      "tessa.ito@client-demo-energy.com",
    ],
    cc: [
      "samuel.baker@client-demo-energy.com",
      "rosa.hall@client-demo-energy.com",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
