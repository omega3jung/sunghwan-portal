import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";
import { internalCategoryMock } from "@/mocks/domain/serviceDesk/categories";

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
import { TicketMockInput } from "./types";

type CategorySnapshot = Pick<DbTicketDetail, "category_id" | "category_name">;

const serviceDeskCategoryMocks = internalCategoryMock;

const resolveServiceDeskCategorySnapshot = (
  categoryId: string,
): CategorySnapshot => {
  const targetCategoryId = Number(categoryId);

  for (const category of serviceDeskCategoryMocks) {
    if (category.category_id === targetCategoryId) {
      return {
        category_id: category.category_id.toString(),
        category_name: category.category_name,
      };
    }

    const subCategory = category.sub_category.find(
      (item) => item.category_id === targetCategoryId,
    );

    if (subCategory) {
      return {
        category_id: subCategory.category_id.toString(),
        category_name: subCategory.category_name,
      };
    }
  }

  throw new Error(`Service Desk category not found: ${categoryId}`);
};

const createTicketMock = (ticket: TicketMockInput): DbTicketDetail => {
  const category = resolveServiceDeskCategorySnapshot(ticket.category_id);

  return {
    ...ticket,
    category_id: category.category_id,
    category_name: category.category_name,
  };
};

const internalTicketMockInputs: TicketMockInput[] = [
  TICKET_2026_1.ticket,
  TICKET_2026_2.ticket,
  TICKET_2026_3.ticket,
  TICKET_2026_4.ticket,
  TICKET_2026_5.ticket,
  TICKET_2026_6.ticket,
  TICKET_2026_7.ticket,
  TICKET_2026_8.ticket,
  TICKET_2026_11.ticket,
  TICKET_2026_12.ticket,
  TICKET_2026_13.ticket,
  TICKET_2026_14.ticket,
  TICKET_2026_15.ticket,
  TICKET_2026_16.ticket,
  TICKET_2026_17.ticket,
  TICKET_2026_18.ticket,
  TICKET_2026_21.ticket,
  TICKET_2026_22.ticket,
  TICKET_2026_23.ticket,
  TICKET_2026_24.ticket,
  TICKET_2026_25.ticket,
  TICKET_2026_26.ticket,
  TICKET_2026_27.ticket,
  TICKET_2026_28.ticket,
  TICKET_2026_31.ticket,
  TICKET_2026_32.ticket,
  TICKET_2026_33.ticket,
  TICKET_2026_34.ticket,
  TICKET_2026_35.ticket,
  TICKET_2026_36.ticket,
  TICKET_2026_37.ticket,
  TICKET_2026_38.ticket,
];

export const internalTicketsMock: DbTicketDetail[] =
  internalTicketMockInputs.map(createTicketMock);
