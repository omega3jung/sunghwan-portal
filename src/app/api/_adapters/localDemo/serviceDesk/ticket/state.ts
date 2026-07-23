import type {
  DbTicketAction,
  DbTicketDetail,
  DbTicketHistory,
} from "@/lib/application/contracts/serviceDesk";
import { ticketActionsMock } from "@/mocks/scenarios/serviceDesk/ticketActionsMock";
import { ticketHistoriesMock } from "@/mocks/scenarios/serviceDesk/ticketHistoriesMock";
import { ticketsMock } from "@/mocks/scenarios/serviceDesk/ticketsMock";

const clone = <T>(value: T): T => structuredClone(value);

type LocalDemoTicketState = {
  tickets: DbTicketDetail[];
  actions: DbTicketAction[];
  histories: DbTicketHistory[];
};

declare global {
  // eslint-disable-next-line no-var
  var __SP_LOCAL_DEMO_TICKET_STATE__: LocalDemoTicketState | undefined;
}

/** Creates one canonical mutable state; tenant views are read-time projections. */
function createLocalDemoTicketState(): LocalDemoTicketState {
  return {
    tickets: clone(ticketsMock),
    actions: clone(ticketActionsMock),
    histories: clone(ticketHistoriesMock),
  };
}

// Local demo mutations must survive refetches and route handler module reloads.
function getLocalDemoTicketState() {
  if (
    !globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ ||
    !Array.isArray(globalThis.__SP_LOCAL_DEMO_TICKET_STATE__.tickets)
  ) {
    globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ = createLocalDemoTicketState();
  }

  return globalThis.__SP_LOCAL_DEMO_TICKET_STATE__;
}

export function getLocalDemoTickets() {
  return getLocalDemoTicketState().tickets;
}

export function getLocalDemoActions() {
  return getLocalDemoTicketState().actions;
}

export function getLocalDemoHistories() {
  return getLocalDemoTicketState().histories;
}

export function resetLocalDemoTicketState() {
  globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ = createLocalDemoTicketState();
}
