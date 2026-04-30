import { TicketMockInput } from "../types";

export const ticket: TicketMockInput = {
  id: "sunghwan-portal-2026-26",
  ticket_number: "SP-2026-0026",
  created_at: "2026-04-02T06:13:27Z",
  updated_at: "2026-04-02T07:13:18Z",
  requester_id: "53",
  status: "Closed",
  close_reason: "Merged",
  priority: "high",
  risk_level: "high",
  assignee_id: ["41", "31"],
  merged_into_ticket_id: "sunghwan-portal-2026-25",
  track_time_minutes: 20,
  last_comment_at: "2026-04-02T07:13:18Z",
  last_commenter_email: "Daniel.Kim@sunghwan-portal.dev",
  due_at: "2026-04-03T18:00:00Z",
  owner: false,
  assigned: false,
  active: true,
  scope: "PORTAL",
  category_id: "5",
  approval_step_id: null,
  subject:
    "Les écrans de réception, de réparation et de contrôle qualité restent bloqués sur le chargement",
  content:
    "Les utilisateurs de la réception, de la réparation et du contrôle qualité ne voient que l’indicateur de chargement et ne peuvent pas poursuivre les transactions.<br>Le problème apparaît à plusieurs étapes du portail, pas seulement sur un seul écran.",
  email: {
    to: ["Evan.Seo@sunghwan-portal.dev", "Daniel.Kim@sunghwan-portal.dev"],
    cc: ["olivia.johnson@sunghwan-portal.dev"],
    bcc: [],
  },
  files: [],
  images: [],
};
