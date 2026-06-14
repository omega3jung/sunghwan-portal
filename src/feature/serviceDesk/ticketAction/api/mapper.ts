import { Attach, TicketAction, TicketActionType } from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

export interface DbTicketAction {
  ticket_id: string;
  action_no: number;

  action_type: TicketActionType;
  content: string;
  owner_id: string;

  created_at: ISODateString;
  updated_at: ISODateString | null;
  active: boolean;

  files: Attach[];
  images: Attach[];
}

export const camelTicketActionMapper: ArrayMapper<
  DbTicketAction,
  TicketAction
> = (data) => {
  return data.map((item) => ({
    ticketId: item.ticket_id,
    actionNo: item.action_no,
    actionType: item.action_type,
    content: item.content,
    ownerUsername: item.owner_id,
    createdAt: item.created_at,
    updatedAt: nullToUndefined(item.updated_at),
    active: item.active,
    files: item.files,
    images: item.images,
  }));
};

export const snakeTicketActionMapper: ArrayMapper<
  TicketAction,
  DbTicketAction
> = (data) => {
  return data.map((item) => ({
    ticket_id: item.ticketId,
    action_no: item.actionNo,
    action_type: item.actionType,
    content: item.content,
    owner_id: item.ownerUsername,
    created_at: item.createdAt,
    updated_at: undefinedToNull(item.updatedAt),
    active: item.active,
    files: item.files,
    images: item.images,
  }));
};

export const mapTicketActionListPayload = createListPayloadMapper(
  camelTicketActionMapper,
);
export const mapTicketActionPayload = createItemPayloadMapper(
  camelTicketActionMapper,
);
export const toTicketActionWritePayload = createItemPayloadMapper(
  snakeTicketActionMapper,
);
