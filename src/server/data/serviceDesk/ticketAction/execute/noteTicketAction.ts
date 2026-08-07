import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";

import { createHistoryOfNoteCreated } from "../../ticketHistory/ticketHistoryEventService";
import type { NormalizedTicketActionPayload } from "../ticketActionRules";

/** Executes note ticket action after shared authorization and payload validation have succeeded. */
export async function executeNoteTicketAction({
  ticketId,
  actionNo,
  currentUserName,
  payload,
  query,
}: {
  ticketId: string;
  actionNo: number;
  currentUserName: string;
  payload: NormalizedTicketActionPayload;
  query: ServiceDeskQueryExecutor;
}) {
  await createHistoryOfNoteCreated(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      metadata: payload.historyMetadata,
    },
    { query },
  );
}
