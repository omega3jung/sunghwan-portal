import type { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { serviceDeskScenariosMock } from "./scenariosMock";
import type { TicketActionMockInput } from "./types";

const toDbTicketAction = (action: TicketActionMockInput): DbTicketAction => ({
  ticket_id: action.tka_ticket_id,
  action_no: action.tka_action_no,
  action_type: action.tka_action_type,
  content: action.tka_content,
  owner_username: action.tka_owner_username,
  created_at: action.tka_created_at,
  updated_at: action.tka_updated_at,
  active: action.tka_active,
  files: action.tka_files,
  images: action.tka_images,
});

/** Canonical action seed shared by every local demo ticket view. */
export const ticketActionsMock: DbTicketAction[] = serviceDeskScenariosMock
  .flatMap((scenario) => scenario.actions)
  .map(toDbTicketAction);

/** @deprecated Use ticketActionsMock. */
export const internalActionsMock = ticketActionsMock;
