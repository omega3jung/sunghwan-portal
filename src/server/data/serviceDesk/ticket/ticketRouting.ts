import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";

import {
  findApprovalStepAssigneeUsernames,
  findCategoryAssignmentUsernames,
  findNextApprovalStepId,
} from "./ticketRepository";

type InitialTicketRouting =
  | {
      status: "Approval";
      approvalStepId: number;
      assigneeUsernames: string[];
    }
  | {
      status: "Assigned";
      approvalStepId: null;
      assigneeUsernames: string[];
    };

/** Resolves initial or restarted routing within the caller's transaction. */
export async function resolveInitialTicketRouting(
  params: { requesterUsername: string; categoryId: number | string },
  options: { query: ServiceDeskQueryExecutor },
): Promise<InitialTicketRouting> {
  const approvalStepId = await findNextApprovalStepId(
    { ...params, currentApprovalStepId: null },
    options,
  );

  if (approvalStepId !== null) {
    const assigneeUsernames = await findApprovalStepAssigneeUsernames(
      { approvalStepId, requesterUsername: params.requesterUsername },
      options,
    );

    if (assigneeUsernames.length === 0) {
      throw createStatusError("Unable to resolve approval assignees.", 409);
    }

    return { status: "Approval", approvalStepId, assigneeUsernames };
  }

  const assigneeUsernames = await findCategoryAssignmentUsernames(params, options);

  if (assigneeUsernames.length === 0) {
    throw createStatusError("Unable to resolve ticket assignees.", 409);
  }

  return { status: "Assigned", approvalStepId: null, assigneeUsernames };
}
