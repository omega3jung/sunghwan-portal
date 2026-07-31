import type { LocalizedName } from "@/domain/organization";
import { Attach, TicketAction, TicketActionType } from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

/** Database-facing ticket action shape used by the Service Desk application boundary. */
export interface DbTicketAction {
  ticket_id: string;
  action_no: number;

  action_type: TicketActionType;
  content: string;
  owner_username: string | null;
  owner_name?: LocalizedName | null;

  created_at: ISODateString;
  updated_at: ISODateString | null;
  active: boolean;

  files: Attach[];
  images: Attach[];
}

/** Maps a database ticket action record into the application-facing model. */
export const camelTicketActionMapper: ArrayMapper<
  DbTicketAction,
  TicketAction
> = (data) => {
  return data.map((item) => ({
    ticketId: item.ticket_id,
    actionNo: item.action_no,
    actionType: item.action_type,
    content: item.content,
    ownerUsername: item.owner_username,
    ownerName: item.owner_name ?? null,
    createdAt: item.created_at,
    updatedAt: nullToUndefined(item.updated_at),
    active: item.active,
    files: item.files,
    images: item.images,
  }));
};

/** Maps an application ticket action model into its database-facing shape. */
export const snakeTicketActionMapper: ArrayMapper<
  TicketAction,
  DbTicketAction
> = (data) => {
  return data.map((item) => ({
    ticket_id: item.ticketId,
    action_no: item.actionNo,
    action_type: item.actionType,
    content: item.content,
    owner_username: item.ownerUsername,
    owner_name: item.ownerName,
    created_at: item.createdAt,
    updated_at: undefinedToNull(item.updatedAt),
    active: item.active,
    files: item.files,
    images: item.images,
  }));
};

/** Maps a ticket action collection payload into application models. */
export const mapTicketActionListPayload = createListPayloadMapper(
  camelTicketActionMapper,
);
/** Maps a ticket action payload into the application model. */
export const mapTicketActionPayload = createItemPayloadMapper(
  camelTicketActionMapper,
);
/** Converts ticket action input into the API write payload. */
export const toTicketActionWritePayload = createItemPayloadMapper(
  snakeTicketActionMapper,
);
