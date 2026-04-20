import client from "@/api/client";
import type { TicketAction } from "@/domain/serviceDesk";
import { TICKET_ACTION_TYPE_TO_PATH } from "@/feature/serviceDesk/ticket/action/constants";
import {
  TicketActionCommandInput,
  TicketActionDeleteInput,
} from "@/feature/serviceDesk/ticket/action/types";
import { OResponse } from "@/shared/types";

type TicketActionResponse = OResponse<TicketAction>;

async function executeAction({
  ticketId,
  actionType,
  values,
}: TicketActionCommandInput): Promise<TicketAction> {
  const actionPath = TICKET_ACTION_TYPE_TO_PATH[actionType];

  const res = await client.api.post<TicketAction>(
    `/api/service-desk/tickets/${ticketId}/command/${actionPath}`,
    values,
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

  assign: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "ASSIGN" }),

  reject: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "REJECT" }),

  merge: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "MERGE" }),

  adjust: (input: Omit<TicketActionCommandInput, "actionType">) =>
    executeAction({ ...input, actionType: "ADJUST" }),

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
