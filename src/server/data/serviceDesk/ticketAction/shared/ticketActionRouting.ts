import type { TicketStatus } from "@/domain/serviceDesk";
import {
  createServiceDeskStatusError as createStatusError,
  type ServiceDeskQueryExecutor,
} from "@/server/data/serviceDesk/shared";
import {
  findApprovalStepAssigneeUsernames,
  findCategoryAssignmentUsernames,
  findNextApprovalStepId,
} from "@/server/data/serviceDesk/ticket/ticketRepository";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";

export type ApprovalRouting = {
  approvalStepId: number | null;
  assigneeUsernames: string[];
  status: TicketStatus;
};

export async function resolveApprovedTicketRouting(
  ticket: ServiceDeskTicketViewRow,
  {
    query,
    currentApprovalStepId,
  }: {
    query: ServiceDeskQueryExecutor;
    currentApprovalStepId: number;
  },
): Promise<ApprovalRouting> {
  const nextApprovalStepId = await findNextApprovalStepId(
    {
      requesterUsername: ticket.tk_requester_username,
      categoryId: ticket.cat_id,
      currentApprovalStepId,
    },
    { query },
  );

  if (nextApprovalStepId !== null) {
    const assigneeUsernames = requireResolvedRoutingAssignees(
      await findApprovalStepAssigneeUsernames(
        {
          approvalStepId: nextApprovalStepId,
          requesterUsername: ticket.tk_requester_username,
        },
        { query },
      ),
      "Unable to resolve approval assignees.",
    );

    return {
      approvalStepId: nextApprovalStepId,
      assigneeUsernames,
      status: "Approval",
    };
  }

  const assigneeUsernames = requireResolvedRoutingAssignees(
    await findCategoryAssignmentUsernames(
      {
        categoryId: ticket.cat_id,
        requesterUsername: ticket.tk_requester_username,
      },
      { query },
    ),
    "Unable to resolve ticket assignees.",
  );

  return {
    approvalStepId: null,
    assigneeUsernames,
    status: "Assigned",
  };
}

export async function resolveInitialTicketRouting(
  ticket: ServiceDeskTicketViewRow,
  { query }: { query: ServiceDeskQueryExecutor },
): Promise<ApprovalRouting> {
  const nextApprovalStepId = await findNextApprovalStepId(
    {
      requesterUsername: ticket.tk_requester_username,
      categoryId: ticket.cat_id,
      currentApprovalStepId: null,
    },
    { query },
  );

  if (nextApprovalStepId !== null) {
    const assigneeUsernames = requireResolvedRoutingAssignees(
      await findApprovalStepAssigneeUsernames(
        {
          approvalStepId: nextApprovalStepId,
          requesterUsername: ticket.tk_requester_username,
        },
        { query },
      ),
      "Unable to resolve approval assignees.",
    );

    return {
      approvalStepId: nextApprovalStepId,
      assigneeUsernames,
      status: "Approval",
    };
  }

  const assigneeUsernames = requireResolvedRoutingAssignees(
    await findCategoryAssignmentUsernames(
      {
        categoryId: ticket.cat_id,
        requesterUsername: ticket.tk_requester_username,
      },
      { query },
    ),
    "Unable to resolve ticket assignees.",
  );

  return {
    approvalStepId: null,
    assigneeUsernames,
    status: "Assigned",
  };
}

function requireResolvedRoutingAssignees(
  assigneeUsernames: string[],
  message: string,
) {
  if (assigneeUsernames.length === 0) {
    throw createStatusError(message, 409);
  }

  return assigneeUsernames;
}
