import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "COMMENT",
    tka_content:
      "Hola, James.<br>Hemos revisado la cuenta de Aria Young y sus sesiones activas. Procederemos a bloquear la cuenta y revocar las credenciales de autenticación.",
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
      "Bloqueamos la cuenta aria.young y cerramos todas las sesiones activas. También revocamos los registros de MFA y los tokens de API emitidos, y confirmamos que no hubo más intentos de inicio de sesión después del bloqueo.",
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
      "El trabajo de seguridad ha finalizado. Se añadió a Matthew Williams, gerente de Recursos Humanos, como responsable para confirmar el registro de baja y que la cuenta debe cerrarse.",
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
      "Hemos confirmado el registro de baja en Recursos Humanos. El último día de trabajo de Aria Young fue el 23 de junio de 2026 y la cuenta debe cerrarse. También actualizamos la lista de verificación de salida para indicar que el bloqueo de la cuenta de IT se completó.",
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
      "La verificación de Recursos Humanos ha finalizado. La cuenta, las sesiones y las credenciales de autenticación están deshabilitadas, por lo que este ticket se marcará como resuelto.",
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
