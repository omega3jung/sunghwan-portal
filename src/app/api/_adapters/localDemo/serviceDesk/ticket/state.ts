import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { DbTicketAction } from "@/lib/application/contracts/serviceDesk";
import { DbTicketHistory } from "@/lib/application/contracts/serviceDesk";
import { clientHistoriesMock } from "@/mocks/scenarios/serviceDesk/clientHistoriesMock";
import { clientActionsMock } from "@/mocks/scenarios/serviceDesk/clientlActionsMock";
import { clientTicketsMock } from "@/mocks/scenarios/serviceDesk/clientTicketsMock";
import { internalActionsMock } from "@/mocks/scenarios/serviceDesk/internalActionsMock";
import { internalHistoriesMock } from "@/mocks/scenarios/serviceDesk/internalHistoriesMock";
import { internalTicketsMock } from "@/mocks/scenarios/serviceDesk/internalTicketsMock";

const clone = <T>(value: T): T => structuredClone(value);
type LocalDemoTicketState = {
  internalTickets: DbTicketDetail[];
  internalActions: DbTicketAction[];
  internalHistories: DbTicketHistory[];
  clientTickets: DbTicketDetail[];
  clientActions: DbTicketAction[];
  clientHistories: DbTicketHistory[];
};

declare global {
  // eslint-disable-next-line no-var
  var __SP_LOCAL_DEMO_TICKET_STATE__: LocalDemoTicketState | undefined;
}

/**
 * Initial mock data is treated as the immutable source snapshot.
 * Runtime state below may be mutated by local demo handlers.
 */
function createLocalDemoTicketState(): LocalDemoTicketState {
  return {
    internalTickets: clone<DbTicketDetail[]>(internalTicketsMock),
    internalActions: clone<DbTicketAction[]>(internalActionsMock),
    internalHistories: clone<DbTicketHistory[]>(internalHistoriesMock),
    clientTickets: clone<DbTicketDetail[]>(clientTicketsMock),
    clientActions: clone<DbTicketAction[]>(clientActionsMock),
    clientHistories: clone<DbTicketHistory[]>(clientHistoriesMock),
  };
}

// Local demo mutations must survive refetches and route handler module reloads.
// globalThis gives us a process-level in-memory store without adding persistence.
function getLocalDemoTicketState() {
  if (!globalThis.__SP_LOCAL_DEMO_TICKET_STATE__) {
    globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ = createLocalDemoTicketState();
  }

  return globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ as LocalDemoTicketState;
}

export function getLocalDemoTickets(isInternal: boolean) {
  const state = getLocalDemoTicketState();
  return isInternal ? state.internalTickets : state.clientTickets;
}
export function getLocalDemoActions(isInternal: boolean) {
  const state = getLocalDemoTicketState();
  return isInternal ? state.internalActions : state.clientActions;
}
export function getLocalDemoHistories(isInternal: boolean) {
  const state = getLocalDemoTicketState();
  return isInternal ? state.internalHistories : state.clientHistories;
}

export function resetLocalDemoTicketState() {
  globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ = createLocalDemoTicketState();
}
