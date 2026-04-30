import { DbTicketDetail } from "@/feature/serviceDesk/ticket";

export type TicketMockInput = Omit<DbTicketDetail, "category_name">;
