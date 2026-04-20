import type { Role } from "@/domain/auth";

export type TicketActionAuthorizationContext = {
  userId: string;
  role: Role | null;
  companyId: string | null;
  departmentId: string | null;
};

export type TicketActionAuthorizationIdentity = {
  userId: string;
  role: Role | null;
  companyId: string | null;
  email?: string | null;
};
