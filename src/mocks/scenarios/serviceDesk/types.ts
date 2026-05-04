import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";

export type TicketMockInput = Omit<DbTicketDetail, "category_name">;
