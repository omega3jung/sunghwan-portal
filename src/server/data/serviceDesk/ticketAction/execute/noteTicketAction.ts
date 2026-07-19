import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";

import { createHistoryOfNoteCreated } from "../../ticketHistory/ticketHistoryEventService";
import type { NormalizedTicketActionPayload } from "../ticketActionRules";

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
