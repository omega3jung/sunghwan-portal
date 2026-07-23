import type { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";

import { serviceDeskScenariosMock } from "./scenariosMock";
import type { TicketHistoryMockInput } from "./types";

const employeeNamesByUsername = new Map(
  allEmployeesMock.map((employee) => [employee.e_username, employee.e_name]),
);

const toDbTicketHistory = (
  history: TicketHistoryMockInput,
): DbTicketHistory => ({
  ticket_id: history.tkh_ticket_id,
  history_no: history.tkh_history_no,
  type: history.tkh_history_type,
  event: history.tkh_event,
  source: history.tkh_source,
  actor_username: history.tkh_actor_username,
  actor_name: history.tkh_actor_username
    ? employeeNamesByUsername.get(history.tkh_actor_username) ?? null
    : null,
  action_no: history.tkh_action_no,
  from_value: history.tkh_from_value,
  to_value: history.tkh_to_value,
  metadata: history.tkh_metadata,
  created_at: history.tkh_created_at,
});

/** Canonical history seed shared by every local demo ticket view. */
export const ticketHistoriesMock: DbTicketHistory[] = serviceDeskScenariosMock
  .flatMap((scenario) => scenario.histories)
  .map(toDbTicketHistory);

/** @deprecated Use ticketHistoriesMock. */
export const internalHistoriesMock = ticketHistoriesMock;
