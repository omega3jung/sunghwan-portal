import type { resolveApprovedTicketRouting } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/createRouting";
import { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

import { mergeTicketToEmails } from "./email";

type ApprovedTicketRouting = Awaited<
  ReturnType<typeof resolveApprovedTicketRouting>
>;

/** Builds ticket status patch without mutating shared LOCAL state. */
export const buildTicketStatusPatch = (
  ticket?: DbTicketDetail,
  nextStatus?: DbTicketDetail["status"],
): Partial<DbTicketDetail> | undefined => {
  if (!ticket || !nextStatus || nextStatus === ticket.status) {
    return undefined;
  }

  return { status: nextStatus };
};

/** Combines defined ticket patches and omits an empty result. */
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

/** Adds the acting employee to the assignee list without creating a duplicate. */
export const mergeAssigneeIds = (
  currentAssigneeIds: DbTicketDetail["assignee_usernames"],
  employeeUserName: string,
) => {
  return currentAssigneeIds.includes(employeeUserName)
    ? currentAssigneeIds
    : [...currentAssigneeIds, employeeUserName];
};

/** Builds approval routing patch without mutating shared LOCAL state. */
export const buildApprovalRoutingPatch = (
  routing: ApprovedTicketRouting,
  employeeUserName: string,
): Partial<DbTicketDetail> => {
  const isApprovalPhase = routing.approvalStepId !== null;
  const assigned = routing.assigneeUsernames.includes(employeeUserName);

  return {
    status: routing.status,
    approval_step_id: routing.approvalStepId,
    assignment_phase: isApprovalPhase ? "APPROVAL" : "WORK",
    approval_assignee_usernames: isApprovalPhase
      ? routing.assigneeUsernames
      : [],
    work_assignee_usernames: isApprovalPhase ? [] : routing.assigneeUsernames,
    assignee_usernames: routing.assigneeUsernames,
    assigned_approver: isApprovalPhase ? assigned : false,
    assigned_worker: isApprovalPhase ? false : assigned,
    assigned,
  };
};

/** Builds assignee patch without mutating shared LOCAL state. */
export const buildAssigneePatch = (
  ticket: DbTicketDetail,
  assigneeUsernames: string[],
  employeeUserName: string,
  assignmentPhase: "APPROVAL" | "WORK",
): Partial<DbTicketDetail> => {
  const assigned = assigneeUsernames.includes(employeeUserName);

  return {
    assignment_phase: assignmentPhase,
    approval_assignee_usernames:
      assignmentPhase === "APPROVAL" ? assigneeUsernames : [],
    work_assignee_usernames:
      assignmentPhase === "WORK" ? assigneeUsernames : [],
    assignee_usernames: assigneeUsernames,
    email: mergeTicketToEmails(ticket, assigneeUsernames),
    assigned_approver: assignmentPhase === "APPROVAL" ? assigned : false,
    assigned_worker: assignmentPhase === "WORK" ? assigned : false,
    assigned,
  };
};
