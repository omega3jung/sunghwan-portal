import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "a54b5287-14af-4e8e-9a9d-61f8f401026b",
  tk_ticket_no: "SP-2026-0052",
  tk_created_at: "2026-07-12T05:46:12Z",
  tk_updated_at: "2026-07-13T08:20:34Z",
  tk_requester_username: "tessa_ito",
  tk_requester: {
    username: "tessa_ito",
    name: {
      en: { first: "Tessa", middle: "", last: "Ito" },
    },
    email: "tessa.ito@client-demo-energy.com",
    image: null,
  },
  tk_status: "Closed",
  tk_close_reason: "Escalated",
  tk_priority: "high",
  tk_risk_level: "medium",
  tk_assignee_usernames: ["adrian_vega", "bianca_davis"],
  tk_merged_into_ticket_id: "37c196e0-106c-471a-8049-7bc1fa9d8431",
  tk_merged_into_ticket_no: "SP-2026-0053",
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
    "Demande de vérification interne du retard de mise à jour des données de production de Solar Farm A",
  tk_content:
    "Bonjour. Les données de production de Solar Farm A dans Energy Operations Dashboard ne sont plus mises à jour depuis le 29 juin 2026 à 14:35.<br><br>Les données de production les plus récentes sont disponibles normalement dans le système de surveillance externe. Veuillez donc vérifier en priorité la collecte interne des données de télémétrie et le traitement des données de rapport. Ce problème affecte l’état opérationnel et les rapports quotidiens de production.",
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
