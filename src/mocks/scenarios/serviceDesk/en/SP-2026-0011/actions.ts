import { TicketActionMockInput } from "../../types";
import { ticket } from "./ticket";

export const actions: TicketActionMockInput[] = [
  {
    tka_ticket_id: ticket.tk_id,
    tka_action_no: 1,
    tka_action_type: "ASSIGN",
    tka_content:
      "Operations, Repair Engineering, Quality, IT, and Contract representatives were added to this ticket to review the support scope for the new manufacturer.",
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
      "From an operations perspective, Demo-Com products can use the existing receiving, work assignment, and shipping processes. However, the manufacturer and product model must be identified first, and we need to confirm whether manufacturer-specific fields are required on packaging labels and shipping documents.",
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
      "The repair process requires Demo-Com-specific inspection items, fault codes, and parts mappings. We need the product model list and service manuals to determine what can be handled with the existing repair result codes.",
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
      "The existing manufacturers' Quality Check criteria cannot be applied without changes. Inspection items, acceptance criteria, and evidence requirements must be configurable as separate QC templates by product family.",
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
      "The current data model can manage basic manufacturer and product model information. Configurable extensions are required for manufacturer-specific Serial Number rules, repair result codes, and QC templates. We also need Demo-Com API specifications and sample data to determine whether external integration is required.",
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
      "The manufacturer API scope and warranty information management terms are not yet confirmed because the contract is still under review. We have asked Demo-Com to provide its product model list, warranty policy, API documentation, and test data.",
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
      "The initial review of the operations and repair processes is complete. After we receive the product model list, warranty policy, and API specifications from the manufacturer, we will finalize the feature scope to request from the portal provider.",
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
