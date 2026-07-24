import { TicketMockInput } from "../../types";

export const ticket: TicketMockInput = {
  tk_id: "c87efd8b-796f-429b-b1c2-275a36a93dd5",
  tk_ticket_no: "SP-2026-0049",
  tk_created_at: "2026-07-09T08:13:53Z",
  tk_updated_at: "2026-07-09T12:45:10Z",
  tk_requester_username: "fiona_tanaka",
  tk_requester: {
    username: "fiona_tanaka",
    name: {
      en: { first: "Fiona", middle: "", last: "Tanaka" },
    },
    email: "fiona.tanaka@client-demo-corporation.com",
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
  tk_work_minutes: 60,
  tka_last_comment_at: "2026-07-09T12:43:05Z",
  tka_last_comment_email: "Evan.Seo@sunghwan-portal.dev",
  tka_last_user_activity_at: "2026-07-09T12:43:05Z",
  tka_last_user_activity_email: "Evan.Seo@sunghwan-portal.dev",
  tk_due_at: "2026-07-10T18:00:00Z",
  tk_active: true,
  cat_scope: "PORTAL",
  cat_id: "108",
  cat_name: {
    en: "Feature Behavior Issues",
    es: "Problemas de comportamiento de funciones",
    fr: "Problèmes de comportement des fonctionnalités",
    ko: "기능 동작 문제",
  },
  tk_approval_step_id: null,
  tk_subject:
    "Erreur d’envoi de la facture d’expédition sur la page End-to-End Unit Repair",
  tk_content:
    "Bonjour. Lorsque le bouton d’envoi de la facture d’expédition est sélectionné pour l’appareil 357849216854353 sur la page End-to-End Unit Repair, une notification d’erreur s’affiche. Veuillez résoudre ce problème afin que l’appareil puisse être expédié dans les meilleurs délais.",
  tk_email: {
    to: [
      "Olivia.Park@sunghwan-portal.dev",
      "Lucas.Han@sunghwan-portal.dev",
      "Logan.Baek@sunghwan-portal.dev",
      "Noah.Yoon@sunghwan-portal.dev",
      "Ella.Nam@sunghwan-portal.dev",
      "Evan.Seo@sunghwan-portal.dev",
      "fiona.tanaka@client-demo-corporation.com",
    ],
    cc: ["elias.martinez@client-demo-corporation.com"],
    bcc: [],
  },
  tk_files: [],
  tk_images: [
    {
      index: 1,
      type: "image",
      name: "ticket_image-1.png",
      url: "/_mocks/scenarios/serviceDesk/ticket-2026-9/ticket_image-1.png",
      active: true,
    },
  ],
};
