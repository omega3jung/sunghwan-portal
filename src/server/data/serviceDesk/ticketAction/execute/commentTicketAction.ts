import type { ServiceDeskQueryExecutor } from "@/server/data/serviceDesk/shared";

import { createHistoryOfCommentCreated } from "../../ticketHistory/ticketHistoryEventService";
import type { NormalizedTicketActionPayload } from "../ticketActionRules";

/** Executes comment ticket action after shared authorization and payload validation have succeeded. */
export async function executeCommentTicketAction({
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
  await createHistoryOfCommentCreated(
    {
      ticketId,
      actionNo,
      actorUsername: currentUserName,
      metadata: payload.historyMetadata,
    },
    { query },
  );
}
