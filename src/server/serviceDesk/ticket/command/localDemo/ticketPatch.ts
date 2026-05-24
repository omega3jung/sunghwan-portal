import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api/types";

export const buildTicketStatusPatch = (
  ticket?: DbTicketDetail,
  nextStatus?: DbTicketDetail["status"],
): Partial<DbTicketDetail> | undefined => {
  if (!ticket || !nextStatus || nextStatus === ticket.status) {
    return undefined;
  }

  return { status: nextStatus };
};

export const mergeActionPatch = (
  ...patches: Array<Partial<DbTicketDetail> | undefined>
): Partial<DbTicketDetail> | undefined => {
  const mergedPatch = Object.assign(
    {},
    ...patches.filter(
      (patch): patch is Partial<DbTicketDetail> => patch !== undefined,
    ),
  );

  return Object.keys(mergedPatch).length > 0 ? mergedPatch : undefined;
};

export const mergeAssigneeIds = (
  currentAssigneeIds: DbTicketDetail["assignee_id"],
  employeeUserName: string,
) => {
  return currentAssigneeIds.includes(employeeUserName)
    ? currentAssigneeIds
    : [...currentAssigneeIds, employeeUserName];
};
