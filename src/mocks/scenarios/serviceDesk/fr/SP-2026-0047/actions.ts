import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "COMMENT",
    tka_content:
      "Bonjour James.<br>Nous avons vérifié le compte d’Aria Young et ses sessions actuellement actives. Nous allons verrouiller le compte et révoquer les informations d’authentification.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T01:20:14Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {},
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,
    tka_action_type: "COMMENT",
    tka_content:
      "Nous avons verrouillé le compte aria.young et fermé toutes les sessions actives. Nous avons également révoqué les inscriptions MFA et les jetons d’API émis, puis confirmé qu’aucune nouvelle tentative de connexion n’avait eu lieu après le verrouillage.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T02:02:38Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      accountUsername: "aria_young",
      securityStatus: "ACCOUNT_LOCKED",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,
    tka_action_type: "ASSIGN",
    tka_content:
      "Les opérations de sécurité sont terminées. Matthew Williams, responsable des Ressources humaines, a été ajouté comme intervenant afin de confirmer le dossier de départ et la clôture requise du compte.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T02:04:12Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      fromAssigneeUsernames: [
        "isabella_oh",
        "julian_moon",
        "benjamin_hong",
        "aria_jeon",
      ],
      toAssigneeUsernames: [
        "isabella_oh",
        "julian_moon",
        "benjamin_hong",
        "aria_jeon",
        "matthew_williams",
      ],
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,
    tka_action_type: "COMMENT",
    tka_content:
      "Nous avons confirmé le dossier de départ auprès des Ressources humaines. Le dernier jour de travail d’Aria Young était le 23 juin 2026 et le compte doit bien être clôturé. La liste de contrôle de départ indique désormais que le verrouillage du compte IT est terminé.",
    tka_owner_username: "matthew_williams",
    tka_created_at: "2026-07-07T02:34:45Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      hrVerificationStatus: "CONFIRMED",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,
    tka_action_type: "COMMENT",
    tka_content:
      "La vérification des Ressources humaines est terminée. Le compte, les sessions et les informations d’authentification sont tous désactivés ; ce ticket va donc être résolu.",
    tka_owner_username: "julian_moon",
    tka_created_at: "2026-07-07T02:40:06Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      resolution: "OFFBOARDING_ACCOUNT_LOCK_COMPLETED",
    },
    tka_files: [],
    tka_images: [],
  },
];
