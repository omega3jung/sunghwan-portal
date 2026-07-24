import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "a92eed5f-b295-4224-8d26-0c14f79435f3",
  tk_ticket_no: "SP-2026-0013",
  tk_created_at: "2026-07-13T08:13:53Z",
  tk_updated_at: "2026-07-13T11:14:20Z",
  tk_requester_username: "tessa_ito",
  tk_requester: {
    username: "tessa_ito",
    name: {
      en: { first: "Tessa", middle: "", last: "Ito" },
    },
    email: "tessa.ito@client-demo-energy.com",
    image: null,
  },
  tk_status: "Resolved",
  tk_priority: "urgent",
  tk_risk_level: "high",
  tk_assignee_usernames: [
    "olivia_park",
    "lucas_han",
    "logan_baek",
    "noah_yoon",
    "ella_nam",
    "evan_seo",
  ],
  tk_work_minutes: 45,
  tka_last_comment_at: "2026-07-13T11:12:08Z",
  tka_last_comment_email: "Evan.Seo@sunghwan-portal.dev",
  tka_last_user_activity_at: "2026-07-13T11:12:08Z",
  tka_last_user_activity_email: "Evan.Seo@sunghwan-portal.dev",
  tk_due_at: "2026-07-14T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "160",
  cat_name: {
    en: "Integration / External System Issues",
    es: "Problemas de integración / sistemas externos",
    fr: "Problèmes d’intégration / systèmes externes",
    ko: "통합 / 외부 시스템 문제",
  },
  tk_approval_step_id: null,
  tk_subject:
    "Solar Farm A Generation Data Update Error on the Energy Operations Dashboard",
  tk_content:
    "Hello. Generation data for Solar Farm A is not updating on Client Demo Energy's Energy Operations Dashboard.<br><br>The last update time is displayed as June 29, 2026, at 14:35, and selecting the Refresh button produces an “Unable to synchronize telemetry data” error. The latest data is available normally in the external monitoring system.<br><br>This is affecting the operational status and daily generation reports, so please investigate as soon as possible.",
  tk_email: {
    to: [
      "Olivia.Park@sunghwan-portal.dev",
      "Lucas.Han@sunghwan-portal.dev",
      "Logan.Baek@sunghwan-portal.dev",
      "Noah.Yoon@sunghwan-portal.dev",
      "Ella.Nam@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
      "tessa.ito@client-demo-energy.com",
    ],
    cc: [
      "samuel.baker@client-demo-energy.com",
      "zoe.okafor@client-demo-energy.com",
    ],
    bcc: [],
  },
  tk_files: [],
  tk_images: [],
};
