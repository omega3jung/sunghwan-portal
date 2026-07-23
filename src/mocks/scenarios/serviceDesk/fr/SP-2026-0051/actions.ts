import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "ASSIGN",
    tka_content:
      "Des représentants des équipes Operations, Repair Engineering, Quality, IT et Contract ont été ajoutés au ticket afin d’étudier le périmètre de prise en charge du nouveau fabricant.",
    tka_owner_username: "yusuf_garcia",
    tka_created_at: "2026-07-11T08:18:20Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      fromAssigneeUsernames: ["yusuf_garcia", "zoe_novak", "bianca_clark"],
      toAssigneeUsernames: [
        "yusuf_garcia",
        "zoe_novak",
        "bianca_clark",
        "rosa_green",
        "adrian_usman",
        "tessa_hassan",
        "ximena_smith",
      ],
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 2,
    tka_action_type: "COMMENT",
    tka_content:
      "Du point de vue des opérations, les produits Demo-Com peuvent utiliser les processus existants de réception, d’affectation du travail et d’expédition. Le fabricant et le modèle doivent toutefois être identifiés au préalable, et nous devons vérifier si les étiquettes d’emballage et les documents d’expédition nécessitent des champs propres au fabricant.",
    tka_owner_username: "rosa_green",
    tka_created_at: "2026-07-11T09:05:44Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      reviewArea: "OPERATIONS",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 3,
    tka_action_type: "COMMENT",
    tka_content:
      "Le processus de réparation nécessite des éléments d’inspection, des codes de panne et des correspondances de pièces propres à Demo-Com. Nous avons besoin de la liste des modèles et des manuels d’entretien pour déterminer ce qui peut être traité avec les codes de résultat existants.",
    tka_owner_username: "adrian_usman",
    tka_created_at: "2026-07-11T11:42:08Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      reviewArea: "REPAIR_ENGINEERING",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 4,
    tka_action_type: "COMMENT",
    tka_content:
      "Les critères de Quality Check des fabricants existants ne peuvent pas être appliqués sans modification. Les éléments d’inspection, les critères d’acceptation et les justificatifs requis doivent être configurables sous forme de modèles QC distincts par famille de produits.",
    tka_owner_username: "tessa_hassan",
    tka_created_at: "2026-07-11T14:18:31Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      reviewArea: "QUALITY",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 5,
    tka_action_type: "COMMENT",
    tka_content:
      "Le modèle de données actuel permet de gérer les informations de base sur le fabricant et le modèle. Des extensions configurables sont nécessaires pour les règles de Serial Number, les codes de résultat de réparation et les modèles QC propres au fabricant. Les spécifications de l’API Demo-Com et des exemples de données sont également nécessaires pour déterminer si une intégration externe est requise.",
    tka_owner_username: "zoe_novak",
    tka_created_at: "2026-07-12T01:15:27Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      reviewArea: "IT",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 6,
    tka_action_type: "COMMENT",
    tka_content:
      "Le périmètre de l’API du fabricant et les conditions de gestion des informations de garantie ne sont pas encore définis, car le contrat est toujours à l’étude. Nous avons demandé à Demo-Com de fournir la liste des modèles, la politique de garantie, la documentation de l’API et des données de test.",
    tka_owner_username: "ximena_smith",
    tka_created_at: "2026-07-12T04:32:50Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      reviewArea: "CONTRACT",
    },
    tka_files: [],
    tka_images: [],
  },
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 7,
    tka_action_type: "COMMENT",
    tka_content:
      "L’étude initiale des processus opérationnels et de réparation est terminée. Après réception de la liste des modèles, de la politique de garantie et des spécifications de l’API du fabricant, nous définirons le périmètre fonctionnel à demander au fournisseur du portail.",
    tka_owner_username: "fiona_tanaka",
    tka_created_at: "2026-07-12T07:42:16Z",
    tka_updated_at: null,
    tka_active: true,
    tka_metadata: {
      reviewStatus: "WAITING_FOR_MANUFACTURER_INFORMATION",
    },
    tka_files: [],
    tka_images: [],
  },
];
