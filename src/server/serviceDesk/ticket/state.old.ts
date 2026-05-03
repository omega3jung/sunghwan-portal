import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";
import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";
import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory/api";
import { clientHistoriesMock } from "@/mocks/scenarios/serviceDesk/clientHistoriesMock";
import { clientActionsMock } from "@/mocks/scenarios/serviceDesk/clientlActionsMock";
import { clientTicketsMock } from "@/mocks/scenarios/serviceDesk/clientTicketsMock";
import { internalActionsMock } from "@/mocks/scenarios/serviceDesk/internalActionsMock";
import { internalHistoriesMock } from "@/mocks/scenarios/serviceDesk/internalHistoriesMock";
import { internalTicketsMock } from "@/mocks/scenarios/serviceDesk/internalTicketsMock";

const clone = <T>(value: T): T => structuredClone(value);

/**
 * Initial mock data is treated as the immutable source snapshot.
 * Runtime state below may be mutated by local demo handlers.
 */
let localDemoInternalTickets = clone<DbTicketDetail[]>(internalTicketsMock);
let localDemoInternalActions = clone<DbTicketAction[]>(internalActionsMock);
let localDemoInternalHistories = clone<DbTicketHistory[]>(
  internalHistoriesMock,
);

let localDemoClientTickets = clone<DbTicketDetail[]>(clientTicketsMock);
let localDemoClientActions = clone<DbTicketAction[]>(clientActionsMock);
let localDemoClientHistories = clone<DbTicketHistory[]>(clientHistoriesMock);

export function getLocalDemoTickets(isInternal: boolean) {
  return isInternal ? localDemoInternalTickets : localDemoClientTickets;
}
export function getLocalDemoActions(isInternal: boolean) {
  return isInternal ? localDemoInternalActions : localDemoClientActions;
}
export function getLocalDemoHistories(isInternal: boolean) {
  return isInternal ? localDemoInternalHistories : localDemoClientHistories;
}

export function resetLocalDemoTicketState() {
  localDemoInternalTickets = clone<DbTicketDetail[]>(internalTicketsMock);
  localDemoInternalActions = clone<DbTicketAction[]>(internalActionsMock);
  localDemoInternalHistories = clone<DbTicketHistory[]>(internalHistoriesMock);
  localDemoClientTickets = clone<DbTicketDetail[]>(clientTicketsMock);
  localDemoClientActions = clone<DbTicketAction[]>(clientActionsMock);
  localDemoClientHistories = clone<DbTicketHistory[]>(clientHistoriesMock);
}
