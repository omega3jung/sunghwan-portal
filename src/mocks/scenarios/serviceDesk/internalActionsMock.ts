import { DbTicketAction } from "@/feature/serviceDesk/ticketAction/api";

import { TICKET_2026_1 } from "./en/SP-2026-0001";
import { TICKET_2026_2 } from "./en/SP-2026-0002";
import { TICKET_2026_3 } from "./en/SP-2026-0003";
import { TICKET_2026_4 } from "./en/SP-2026-0004";
import { TICKET_2026_5 } from "./en/SP-2026-0005";
import { TICKET_2026_6 } from "./en/SP-2026-0006";
import { TICKET_2026_7 } from "./en/SP-2026-0007";
import { TICKET_2026_8 } from "./en/SP-2026-0008";
import { TICKET_2026_9 } from "./en/SP-2026-0009";
import { TICKET_2026_10 } from "./en/SP-2026-0010";
import { TICKET_2026_11 } from "./en/SP-2026-0011";
import { TICKET_2026_12 } from "./en/SP-2026-0012";
import { TICKET_2026_13 } from "./en/SP-2026-0013";
import { TICKET_2026_14 } from "./en/SP-2026-0014";
import { TICKET_2026_15 } from "./en/SP-2026-0015";
import { TICKET_2026_16 } from "./en/SP-2026-0016";
import { TICKET_2026_21 } from "./es/SP-2026-0021";
import { TICKET_2026_22 } from "./es/SP-2026-0022";
import { TICKET_2026_23 } from "./es/SP-2026-0023";
import { TICKET_2026_24 } from "./es/SP-2026-0024";
import { TICKET_2026_25 } from "./es/SP-2026-0025";
import { TICKET_2026_26 } from "./es/SP-2026-0026";
import { TICKET_2026_27 } from "./es/SP-2026-0027";
import { TICKET_2026_28 } from "./es/SP-2026-0028";
import { TICKET_2026_29 } from "./es/SP-2026-0029";
import { TICKET_2026_30 } from "./es/SP-2026-0030";
import { TICKET_2026_31 } from "./es/SP-2026-0031";
import { TICKET_2026_32 } from "./es/SP-2026-0032";
import { TICKET_2026_33 } from "./es/SP-2026-0033";
import { TICKET_2026_34 } from "./es/SP-2026-0034";
import { TICKET_2026_35 } from "./es/SP-2026-0035";
import { TICKET_2026_36 } from "./es/SP-2026-0036";
import { TICKET_2026_41 } from "./fr/SP-2026-0041";
import { TICKET_2026_42 } from "./fr/SP-2026-0042";
import { TICKET_2026_43 } from "./fr/SP-2026-0043";
import { TICKET_2026_44 } from "./fr/SP-2026-0044";
import { TICKET_2026_45 } from "./fr/SP-2026-0045";
import { TICKET_2026_46 } from "./fr/SP-2026-0046";
import { TICKET_2026_47 } from "./fr/SP-2026-0047";
import { TICKET_2026_48 } from "./fr/SP-2026-0048";
import { TICKET_2026_49 } from "./fr/SP-2026-0049";
import { TICKET_2026_50 } from "./fr/SP-2026-0050";
import { TICKET_2026_51 } from "./fr/SP-2026-0051";
import { TICKET_2026_52 } from "./fr/SP-2026-0052";
import { TICKET_2026_53 } from "./fr/SP-2026-0053";
import { TICKET_2026_54 } from "./fr/SP-2026-0054";
import { TICKET_2026_55 } from "./fr/SP-2026-0055";
import { TICKET_2026_56 } from "./fr/SP-2026-0056";
import { TICKET_2026_61 } from "./ko/SP-2026-0061";
import { TICKET_2026_62 } from "./ko/SP-2026-0062";
import { TICKET_2026_63 } from "./ko/SP-2026-0063";
import { TICKET_2026_64 } from "./ko/SP-2026-0064";
import { TICKET_2026_65 } from "./ko/SP-2026-0065";
import { TICKET_2026_66 } from "./ko/SP-2026-0066";
import { TICKET_2026_67 } from "./ko/SP-2026-0067";
import { TICKET_2026_68 } from "./ko/SP-2026-0068";
import { TICKET_2026_69 } from "./ko/SP-2026-0069";
import { TICKET_2026_70 } from "./ko/SP-2026-0070";
import { TICKET_2026_71 } from "./ko/SP-2026-0071";
import { TICKET_2026_72 } from "./ko/SP-2026-0072";
import { TICKET_2026_73 } from "./ko/SP-2026-0073";
import { TICKET_2026_74 } from "./ko/SP-2026-0074";
import { TICKET_2026_75 } from "./ko/SP-2026-0075";
import { TICKET_2026_76 } from "./ko/SP-2026-0076";
import { TicketActionMockInput } from "./types";

const internalActionMockInputs: TicketActionMockInput[] = [
  ...TICKET_2026_1.actions,
  ...TICKET_2026_2.actions,
  ...TICKET_2026_3.actions,
  ...TICKET_2026_4.actions,
  ...TICKET_2026_5.actions,
  ...TICKET_2026_6.actions,
  ...TICKET_2026_7.actions,
  ...TICKET_2026_9.actions,
  ...TICKET_2026_10.actions,
  ...TICKET_2026_11.actions,
  ...TICKET_2026_12.actions,
  ...TICKET_2026_13.actions,
  ...TICKET_2026_14.actions,
  ...TICKET_2026_15.actions,
  ...TICKET_2026_16.actions,
  ...TICKET_2026_8.actions,
  ...TICKET_2026_21.actions,
  ...TICKET_2026_22.actions,
  ...TICKET_2026_23.actions,
  ...TICKET_2026_24.actions,
  ...TICKET_2026_25.actions,
  ...TICKET_2026_26.actions,
  ...TICKET_2026_27.actions,
  ...TICKET_2026_29.actions,
  ...TICKET_2026_30.actions,
  ...TICKET_2026_31.actions,
  ...TICKET_2026_32.actions,
  ...TICKET_2026_33.actions,
  ...TICKET_2026_34.actions,
  ...TICKET_2026_35.actions,
  ...TICKET_2026_36.actions,
  ...TICKET_2026_28.actions,
  ...TICKET_2026_41.actions,
  ...TICKET_2026_42.actions,
  ...TICKET_2026_43.actions,
  ...TICKET_2026_44.actions,
  ...TICKET_2026_45.actions,
  ...TICKET_2026_46.actions,
  ...TICKET_2026_47.actions,
  ...TICKET_2026_49.actions,
  ...TICKET_2026_50.actions,
  ...TICKET_2026_51.actions,
  ...TICKET_2026_52.actions,
  ...TICKET_2026_53.actions,
  ...TICKET_2026_54.actions,
  ...TICKET_2026_55.actions,
  ...TICKET_2026_56.actions,
  ...TICKET_2026_48.actions,
  ...TICKET_2026_61.actions,
  ...TICKET_2026_62.actions,
  ...TICKET_2026_63.actions,
  ...TICKET_2026_64.actions,
  ...TICKET_2026_65.actions,
  ...TICKET_2026_66.actions,
  ...TICKET_2026_67.actions,
  ...TICKET_2026_69.actions,
  ...TICKET_2026_70.actions,
  ...TICKET_2026_71.actions,
  ...TICKET_2026_72.actions,
  ...TICKET_2026_73.actions,
  ...TICKET_2026_74.actions,
  ...TICKET_2026_75.actions,
  ...TICKET_2026_76.actions,
  ...TICKET_2026_68.actions,
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
