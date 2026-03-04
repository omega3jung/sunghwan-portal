import { TicketAttach } from "./enums";

export interface Attach {
  index: number;
  type: TicketAttach;
  name: string;
  url: string;
  active: boolean;
}
