import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "ASSIGN",
    tka_content:
      "Se añadieron representantes de Operations, Repair Engineering, Quality, IT y Contract al ticket para revisar el alcance de soporte del nuevo fabricante.",
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
      "Desde la perspectiva de operaciones, los productos de Demo-Com pueden utilizar los procesos existentes de recepción, asignación de trabajo y envío. Sin embargo, primero deben identificarse el fabricante y el modelo, y debemos confirmar si las etiquetas de embalaje y los documentos de envío requieren campos específicos del fabricante.",
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
      "El proceso de reparación requiere elementos de inspección, códigos de fallo y asignaciones de piezas específicos de Demo-Com. Necesitamos la lista de modelos y los manuales de servicio para determinar qué puede gestionarse con los códigos de resultado actuales.",
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
      "Los criterios de Quality Check de los fabricantes existentes no pueden aplicarse sin cambios. Los elementos de inspección, los criterios de aceptación y las pruebas requeridas deben poder configurarse como plantillas de QC independientes por familia de productos.",
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
      "El modelo de datos actual puede gestionar la información básica del fabricante y del modelo. Se requieren extensiones configurables para las reglas de Serial Number, los códigos de resultado de reparación y las plantillas de QC específicas del fabricante. También necesitamos las especificaciones de la API y datos de muestra de Demo-Com para determinar si se requiere una integración externa.",
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
      "El alcance de la API del fabricante y las condiciones para gestionar la información de garantía aún no están definidos porque el contrato sigue en revisión. Hemos solicitado a Demo-Com la lista de modelos, la política de garantía, la documentación de la API y datos de prueba.",
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
      "La revisión inicial de los procesos operativos y de reparación ha finalizado. Cuando recibamos del fabricante la lista de modelos, la política de garantía y las especificaciones de la API, definiremos el alcance funcional que solicitaremos al proveedor del portal.",
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
