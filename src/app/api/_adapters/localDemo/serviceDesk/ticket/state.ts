import type {
  DbTicketAction,
  DbTicketDetail,
  DbTicketHistory,
} from "@/lib/application/contracts/serviceDesk";
import { ticketActionsMock } from "@/mocks/scenarios/serviceDesk/ticketActionsMock";
import { ticketHistoriesMock } from "@/mocks/scenarios/serviceDesk/ticketHistoriesMock";
import { ticketsMock } from "@/mocks/scenarios/serviceDesk/ticketsMock";

/**
 * Process-local mutable ticket state for the Next.js LOCAL demo runtime.
 *
 * This is server memory, not browser state or durable persistence. It survives
 * React Query refetches and route-module reloads within the same process, but a
 * cold start, server restart, or redeployment may restore the fixtures.
 */
const clone = <T>(value: T): T => structuredClone(value);

type LocalDemoTicketState = {
  tickets: DbTicketDetail[];
  actions: DbTicketAction[];
  histories: DbTicketHistory[];
};

declare global {
  var __SP_LOCAL_DEMO_TICKET_STATE__: LocalDemoTicketState | undefined;
}

/**
 * Creates a mutable copy of the canonical fixtures.
 *
 * Deep cloning keeps fixture modules immutable so the reset endpoint can always
 * restore deterministic data after a reviewer mutates tickets or activities.
 * Tenant and scope views are derived later; they are not separate state stores.
 */
function createLocalDemoTicketState(): LocalDemoTicketState {
  return {
    tickets: clone(ticketsMock),
    actions: clone(ticketActionsMock),
    histories: clone(ticketHistoriesMock),
  };
}

// React Query is only a client cache. The process-level object is the LOCAL
// source of truth seen by subsequent route requests in this server instance.
function getLocalDemoTicketState() {
  if (
    !globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ ||
    !Array.isArray(globalThis.__SP_LOCAL_DEMO_TICKET_STATE__.tickets)
  ) {
    globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ = createLocalDemoTicketState();
  }

  return globalThis.__SP_LOCAL_DEMO_TICKET_STATE__;
}

/** Returns demo tickets from the server-side LOCAL ticket adapter. */
export function getLocalDemoTickets() {
  return getLocalDemoTicketState().tickets;
}

/** Returns demo actions from the server-side LOCAL ticket adapter. */
export function getLocalDemoActions() {
  return getLocalDemoTicketState().actions;
}

/** Returns demo histories from the server-side LOCAL ticket adapter. */
export function getLocalDemoHistories() {
  return getLocalDemoTicketState().histories;
}

/** Restores the mutable process state from untouched fixture snapshots. */
export function resetLocalDemoTicketState() {
  globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ = createLocalDemoTicketState();
}
