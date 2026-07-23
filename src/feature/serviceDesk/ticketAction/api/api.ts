import type { TicketAction } from "@/domain/serviceDesk";
import client from "@/lib/client/api";
import { OResponse } from "@/shared/types";

import { TICKET_ACTION_TYPE_TO_PATH } from "../constants";
import { TicketActionCommandInput, TicketActionDeleteInput } from "../types";

type TicketActionResponse = OResponse<TicketAction>;
type ApprovalTicketActionRequest = {
  content: string;
};

function toTicketActionRequestBody({
  actionType,
  values,
}: Pick<TicketActionCommandInput, "actionType" | "values">):
  | TicketActionCommandInput["values"]
  | ApprovalTicketActionRequest {
  if (actionType === "APPROVE" || actionType === "DECLINE") {
    return {
      content: values.content,
    };
  }

  return values;
}

async function executeAction({
  ticketId,
  actionType,
  values,
}: TicketActionCommandInput): Promise<TicketAction> {
  const actionPath = TICKET_ACTION_TYPE_TO_PATH[actionType];
  const body = toTicketActionRequestBody({ actionType, values });

  const res = await client.api.post<TicketAction>(
    `/api/service-desk/tickets/${ticketId}/command/${actionPath}`,
    body,
  );

  return res.data;
}

export const serviceDeskTicketActionApi = {
  list: async (ticketId: string): Promise<TicketAction[]> => {
    if (!ticketId) return [];

    const res = await client.api.get<TicketActionResponse>(
      `/api/service-desk/tickets/${ticketId}/actions`,
    );

    return res.data.items;
  },

  get: async (
    ticketId: string,
    actionNo: string,
  ): Promise<TicketAction | null> => {
    if (!ticketId || !actionNo) return null;

    const res = await client.api.get<TicketAction>(
      `/api/service-desk/tickets/${ticketId}/actions/${actionNo}`,
    );

    return res.data;
  },

  execute: executeAction,

  comment: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "COMMENT" }),

  note: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "NOTE" }),

  approve: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "APPROVE" }),

  decline: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "DECLINE" }),

  assign: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "ASSIGN" }),

  assignSelf: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "ASSIGN_SELF" }),

  reject: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "REJECT" }),

  merge: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "MERGE" }),

  adjust: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "ADJUST" }),

  reopen: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "REOPEN" }),

  resubmit: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "RESUBMIT" }),

  cancel: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "CANCEL" }),

  remove: async ({
    ticketId,
    actionNo,
  }: TicketActionDeleteInput): Promise<null> => {
    await client.api.patch(
      `/api/service-desk/tickets/${ticketId}/actions/${actionNo}`,
      { active: false },
    );

    return null;
  },
};
