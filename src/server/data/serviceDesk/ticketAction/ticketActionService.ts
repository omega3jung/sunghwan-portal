import {
  resolveTicketActionExecutionMode,
  type TicketActionCommandRequest,
  type TicketApprovalActionCommandRequest,
  type TicketApprovalActionPath,
  type TicketGeneralActionPath,
} from "@/lib/application/contracts/serviceDesk";
import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";
import {
  findActiveTicketViewRowById,
  findActiveTicketViewRowByIdIncludingDraft,
} from "@/server/data/serviceDesk/ticket/ticketRepository";
import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";

import { createTicketHistory } from "../ticketHistory/ticketHistoryService";
import {
  applyTicketActionEffect,
  approveTicket,
  declineTicket,
  resolveMergeTargetTicket,
} from "./execute";
import type {
  CreateApprovalTicketActionDto,
  TicketActionDto,
} from "./ticketActionDto";
import { mapTicketActionRowToDto } from "./ticketActionMapper";
import {
  createApprovalTicketActionRow,
  createTicketActionRow,
  type CreateTicketActionRowInput,
  findActiveTicketActionRowByTicketIdAndNo,
  findActiveTicketActionRowsByTicketId,
  findNextTicketActionNo,
  softDeleteTicketActionRow,
  type TicketActionRepositoryOptions,
} from "./ticketActionRepository";
import {
  APPROVAL_ACTION_TYPE_BY_PATH,
  APPROVAL_ACTION_TYPES,
  assertApprovalActionAllowed,
  assertTicketActionAllowed,
  validateApprovalActionPayload,
  validateTicketActionPayload,
} from "./ticketActionRules";

type TicketActionServiceOptions = TicketActionRepositoryOptions;

type TicketApprovalActionInput = {
  ticketId: string;
  action: TicketApprovalActionPath;
  currentUserName: string;
  payload: TicketApprovalActionCommandRequest;
  isAdmin?: boolean;
};
type TicketActionInput = {
  ticketId: string;
  action: TicketGeneralActionPath;
  currentUserName: string;
  payload: TicketActionCommandRequest;
  isAdmin?: boolean;
  isInternal?: boolean;
};
type TicketActionDeleteInput = {
  ticketId: string;
  actionNo: number;
  currentUserName: string;
};

/** Loads ticket actions by ticket id through the server data boundary. */
export async function getTicketActionsByTicketId(
  ticketId: string,
  options?: TicketActionServiceOptions,
): Promise<TicketActionDto[]> {
  const rows = await findActiveTicketActionRowsByTicketId(ticketId, options);

  return rows.map(mapTicketActionRowToDto);
}

/** Creates ticket action through the server persistence boundary. */
export async function createTicketAction(
  input: Omit<CreateTicketActionRowInput, "actionNo">,
  options?: TicketActionServiceOptions,
): Promise<TicketActionDto> {
  const actionNo = await findNextTicketActionNo(input.ticketId, options);
  const row = await createTicketActionRow(
    {
      ...input,
      actionNo,
    },
    options,
  );

  if (!row) {
    throw createStatusError("Unable to create ticket action.", 409);
  }

  return mapTicketActionRowToDto(row);
}

/** Creates approval ticket action through the server persistence boundary. */
export async function createApprovalTicketAction(
  input: CreateApprovalTicketActionDto,
  options?: TicketActionServiceOptions,
): Promise<TicketActionDto> {
  const content = input.content.trim();

  if (!APPROVAL_ACTION_TYPES.has(input.actionType)) {
    throw createStatusError("Invalid approval action type.", 400);
  }

  if (!content) {
    throw createStatusError("Approval action content is required.", 400);
  }

  if (!input.ownerUsername.trim()) {
    throw createStatusError("Approval action owner is required.", 401);
  }

  const row = await createApprovalTicketActionRow(
    {
      ticketId: input.ticketId,
      actionType: input.actionType,
      content,
      metadata: input.metadata ?? {},
      ownerUsername: input.ownerUsername,
    },
    options,
  );

  if (!row) {
    throw createStatusError("Unable to create approval ticket action.", 409);
  }

  return mapTicketActionRowToDto(row);
}

/**
 * Soft-deletes user-authored commentary without rewriting operational history.
 *
 * COMMENT and NOTE records may be hidden only by their writer. Workflow actions
 * remain immutable evidence. The row update and deletion history event share a
 * transaction so consumers never observe one without the other.
 */
export async function softDeleteTicketAction({
  ticketId,
  actionNo,
  currentUserName,
}: TicketActionDeleteInput): Promise<TicketActionDto> {
  return withPortalApiTransaction(async (query) => {
    const ticket = await findActiveTicketViewRowByIdIncludingDraft(ticketId, {
      query,
    });

    if (!ticket) {
      throw createStatusError("Ticket not found.", 404);
    }

    if (ticket.tk_status === "Draft" || ticket.tk_status === "Closed") {
      throw createStatusError(
        "Actions cannot be removed in the current ticket status.",
        409,
      );
    }

    const action = await findActiveTicketActionRowByTicketIdAndNo(
      ticketId,
      actionNo,
      { query },
    );

    if (!action) {
      throw createStatusError("Ticket action not found.", 404);
    }

    if (
      action.tka_action_type !== "COMMENT" &&
      action.tka_action_type !== "NOTE"
    ) {
      throw createStatusError("Operational actions cannot be removed.", 403);
    }

    if (action.tka_owner_username !== currentUserName) {
      throw createStatusError("Only the action writer can remove it.", 403);
    }

    const deletedAction = await softDeleteTicketActionRow(ticketId, actionNo, {
      query,
    });

    if (!deletedAction) {
      throw createStatusError("Ticket action could not be removed.", 409);
    }

    await createTicketHistory(
      {
        ticketId,
        actionNo,
        historyType: action.tka_action_type === "COMMENT" ? "COMMENT" : "NOTE",
        source: "USER_ACTION",
        event:
          action.tka_action_type === "COMMENT"
            ? "COMMENT_DELETED"
            : "NOTE_DELETED",
        actorUsername: currentUserName,
        fromValue: { active: true },
        toValue: { active: false },
        metadata: {
          actionType: action.tka_action_type,
          previousActive: true,
          nextActive: false,
        },
      },
      { query },
    );

    return mapTicketActionRowToDto(deletedAction);
  });
}

/**
 * Records an approval decision and applies its routing effect atomically.
 * The action row, ticket state, next approvers, and history therefore describe
 * one committed decision rather than independently successful writes.
 */
export async function executeTicketApprovalAction({
  ticketId,
  action,
  currentUserName,
  payload,
  isAdmin = false,
}: TicketApprovalActionInput) {
  const content = validateApprovalActionPayload(action, payload);

  return withPortalApiTransaction(async (query) => {
    const ticket = await findActiveTicketViewRowById(ticketId, { query });

    if (!ticket) {
      throw createStatusError("Ticket not found.", 404);
    }

    assertApprovalActionAllowed(ticket, currentUserName, isAdmin);

    const actionDto = await createApprovalTicketAction(
      {
        ticketId,
        actionType: APPROVAL_ACTION_TYPE_BY_PATH[action],
        content,
        metadata: {
          source: "ticketActionTool",
        },
        ownerUsername: currentUserName,
      },
      { query },
    );

    if (action === "approve") {
      await approveTicket({
        ticket,
        ticketId,
        currentUserName,
        isAdmin,
        actionNo: actionDto.action_no,
        query,
      });
    } else {
      await declineTicket({
        ticket,
        ticketId,
        currentUserName,
        isAdmin,
        actionNo: actionDto.action_no,
        reason: content,
        fromStatus: ticket.tk_status,
        toStatus: "Declined",
        query,
      });
    }

    return actionDto;
  });
}

/**
 * Executes a general ticket command against the current canonical ticket row.
 *
 * Payload normalization happens before opening the transaction. Authorization,
 * action creation, state/routing effects, and history then use the same query
 * executor, so a failed effect cannot leave a misleading action in the timeline.
 */
export async function executeTicketAction({
  ticketId,
  action,
  currentUserName,
  payload,
  isAdmin = false,
  isInternal = false,
}: TicketActionInput) {
  const normalizedPayload = validateTicketActionPayload(action, payload);

  if (!currentUserName.trim()) {
    throw createStatusError("Ticket action owner is required.", 401);
  }

  return withPortalApiTransaction(async (query) => {
    const ticket = await findActiveTicketViewRowByIdIncludingDraft(ticketId, {
      query,
    });

    if (!ticket) {
      throw createStatusError("Ticket not found.", 404);
    }

    if (
      action === "assign" &&
      !isInternal &&
      ticket.cat_scope === "PORTAL"
    ) {
      throw createStatusError(
        "Tenant users cannot assign provider employees on portal tickets.",
        403,
      );
    }

    const actionMode = resolveTicketActionExecutionMode(action, isAdmin);

    assertTicketActionAllowed(actionMode, ticket.tk_status);

    const targetTicket =
      action === "merge"
        ? await resolveMergeTargetTicket({
            ticket,
            targetTicketId: normalizedPayload.targetTicketId,
            query,
          })
        : null;

    const actionDto = await createTicketAction(
      {
        ticketId,
        actionType: normalizedPayload.actionType,
        content: normalizedPayload.content,
        metadata: normalizedPayload.metadata,
        ownerUsername: currentUserName,
        files: normalizedPayload.files,
        images: normalizedPayload.images,
      },
      { query },
    );

    await applyTicketActionEffect({
      action,
      actionMode,
      ticket,
      targetTicket,
      ticketId,
      actionNo: actionDto.action_no,
      currentUserName,
      isAdmin,
      payload: normalizedPayload,
      query,
    });

    return actionDto;
  });
}
