import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "89cde61d-2313-4abb-a73e-08e40be40df1",
  tk_ticket_no: "SP-2026-0003",
  tk_created_at: "2026-07-03T01:14:33Z",
  tk_updated_at: "2026-07-06T02:02:00Z",
  tk_requester_username: "liam_williams",
  tk_status: "Working",
  tk_priority: "medium",
  tk_risk_level: "low",
  tk_assignee_usernames: ["evan_seo", "mason_kwon"],
  tk_work_minutes: 80,
  tka_last_comment_at: "2026-07-06T01:48:10Z",
  tka_last_comment_email: "Mason.Kwon@sunghwan-portal.dev",

  tka_last_user_activity_at: "2026-07-06T01:48:10Z",
  tka_last_user_activity_email: "Mason.Kwon@sunghwan-portal.dev",
  tk_due_at: "2026-07-06T18:00:00Z",
  tk_active: true,
  cat_scope: "INTERNAL",
  cat_id: "53",
  cat_name: {
    en: "Label printer issue",
    es: "Problema de impresora de etiquetas",
    fr: "Problème d’imprimante d’étiquettes",
    ko: "라벨 프린터 문제",
  },
  tk_approval_step_id: null,
  tk_subject: "Set up barcode",
  tk_content:
    "Hi, we got smaple barcode form customer.<br>Could you set it up?",
  tk_email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "liam.williams@sunghwan-portal.dev"],
    cc: ["Mason.Kwon@sunghwan-portal.dev"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [
    {
      index: 1,
      type: "image",
      name: "ticket_image-1.png",
      url: "/_mocks/scenarios/serviceDesk/ticket-2026-3/ticket_image-1.png",
      active: true,
    },
  ],
};
