import type { TicketActionAuthorizationContext } from "./types";

const IT_DEPARTMENT_IDS = new Set(["10", "11", "12", "13", "14"]);

export function isItDepartment(departmentId: string | null | undefined) {
  return typeof departmentId === "string" && IT_DEPARTMENT_IDS.has(departmentId);
}

export function isAdmin(
  context: TicketActionAuthorizationContext | null | undefined,
) {
  return context?.role === "ADMIN";
}

export function isItManager(
  context: TicketActionAuthorizationContext | null | undefined,
) {
  return context?.role === "MANAGER" && isItDepartment(context.departmentId);
}

export function isManagerLevelTicketActionAllowed(
  context: TicketActionAuthorizationContext | null | undefined,
) {
  return isAdmin(context) || isItManager(context);
}
