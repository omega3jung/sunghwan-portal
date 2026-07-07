import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { TICKET_2026_1 } from "./SP-2026-0001";
import { TICKET_2026_2 } from "./SP-2026-0002";
import { TICKET_2026_3 } from "./SP-2026-0003";
import { TICKET_2026_4 } from "./SP-2026-0004";
import { TICKET_2026_5 } from "./SP-2026-0005";
import { TICKET_2026_6 } from "./SP-2026-0006";
import { TICKET_2026_7 } from "./SP-2026-0007";
import { TICKET_2026_8 } from "./SP-2026-0008";
import { TICKET_2026_11 } from "./SP-2026-0011";
import { TICKET_2026_12 } from "./SP-2026-0012";
import { TICKET_2026_13 } from "./SP-2026-0013";
import { TICKET_2026_14 } from "./SP-2026-0014";
import { TICKET_2026_15 } from "./SP-2026-0015";
import { TICKET_2026_16 } from "./SP-2026-0016";
import { TICKET_2026_17 } from "./SP-2026-0017";
import { TICKET_2026_18 } from "./SP-2026-0018";
import { TICKET_2026_21 } from "./SP-2026-0021";
import { TICKET_2026_22 } from "./SP-2026-0022";
import { TICKET_2026_23 } from "./SP-2026-0023";
import { TICKET_2026_24 } from "./SP-2026-0024";
import { TICKET_2026_25 } from "./SP-2026-0025";
import { TICKET_2026_26 } from "./SP-2026-0026";
import { TICKET_2026_27 } from "./SP-2026-0027";
import { TICKET_2026_28 } from "./SP-2026-0028";
import { TICKET_2026_31 } from "./SP-2026-0031";
import { TICKET_2026_32 } from "./SP-2026-0032";
import { TICKET_2026_33 } from "./SP-2026-0033";
import { TICKET_2026_34 } from "./SP-2026-0034";
import { TICKET_2026_35 } from "./SP-2026-0035";
import { TICKET_2026_36 } from "./SP-2026-0036";
import { TICKET_2026_37 } from "./SP-2026-0037";
import { TICKET_2026_38 } from "./SP-2026-0038";
import { TicketActionMockInput } from "./types";

const internalActionMockInputs: TicketActionMockInput[] = [
  ...TICKET_2026_1.actions,
  ...TICKET_2026_2.actions,
  ...TICKET_2026_3.actions,
  ...TICKET_2026_4.actions,
  ...TICKET_2026_5.actions,
  ...TICKET_2026_6.actions,
  ...TICKET_2026_7.actions,
  ...TICKET_2026_8.actions,
  ...TICKET_2026_11.actions,
  ...TICKET_2026_12.actions,
  ...TICKET_2026_13.actions,
  ...TICKET_2026_14.actions,
  ...TICKET_2026_15.actions,
  ...TICKET_2026_16.actions,
  ...TICKET_2026_17.actions,
  ...TICKET_2026_18.actions,
  ...TICKET_2026_21.actions,
  ...TICKET_2026_22.actions,
  ...TICKET_2026_23.actions,
  ...TICKET_2026_24.actions,
  ...TICKET_2026_25.actions,
  ...TICKET_2026_26.actions,
  ...TICKET_2026_27.actions,
  ...TICKET_2026_28.actions,
  ...TICKET_2026_31.actions,
  ...TICKET_2026_32.actions,
  ...TICKET_2026_33.actions,
  ...TICKET_2026_34.actions,
  ...TICKET_2026_35.actions,
  ...TICKET_2026_36.actions,
  ...TICKET_2026_37.actions,
  ...TICKET_2026_38.actions,
];

const toDbTicketAction = (action: TicketActionMockInput): DbTicketAction => ({
  ticket_id: action.tka_ticket_id,
  action_no: action.tka_action_no,
  action_type: action.tka_action_type,
  content: action.tka_content,
  owner_username: action.tka_owner_username,
  created_at: action.tka_created_at,
  updated_at: action.tka_updated_at,
  active: action.tka_active,
  files: action.tka_files,
  images: action.tka_images,
});

export const internalActionsMock: DbTicketAction[] =
  internalActionMockInputs.map(toDbTicketAction);
