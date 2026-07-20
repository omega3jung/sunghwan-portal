import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "37c196e0-106c-471a-8049-7bc1fa9d8431",
  tk_ticket_no: "SP-2026-0053",
  tk_created_at: "2026-07-13T08:13:53Z",
  tk_updated_at: "2026-07-13T11:14:20Z",
  tk_requester_username: "tessa_ito",
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
    "Erreur de mise à jour des données de production de Solar Farm A dans Energy Operations Dashboard",
  tk_content:
    "Bonjour. Les données de production de Solar Farm A ne sont pas mises à jour dans Energy Operations Dashboard sur le portail de Client Demo Energy.<br><br>La dernière mise à jour affichée date du 29 juin 2026 à 14:35 et le bouton Refresh génère l’erreur « Unable to synchronize telemetry data ». Les données les plus récentes sont disponibles normalement dans le système de surveillance externe.<br><br>Ce problème affecte l’état opérationnel et les rapports quotidiens de production ; nous demandons donc une vérification rapide.",
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
