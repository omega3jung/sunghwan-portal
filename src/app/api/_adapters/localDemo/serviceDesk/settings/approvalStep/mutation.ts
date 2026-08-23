import {
  getLocalDemoCategories,
  replaceLocalDemoApprovalStepCategories,
} from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { resolveCreateTicketRouting } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/createRouting";
import {
  getLocalDemoHistories,
  getLocalDemoTickets,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";
import type { SaveServiceDeskApprovalStepTreePayload } from "@/lib/application/contracts/serviceDesk";

import {
  createApprovalStepIdAssigner,
  getApprovalStepStore,
  getTenantCategoriesOrThrow,
  type LocalDbApprovalStep,
  normalizeCategoryApprovalSettings,
} from "./approvalStepUtils";
import { buildApprovalStepFromInput, createFallbackCategory } from "./treeSync";

/**
 * Replaces approval-step slices for submitted categories in LOCAL state.
 *
 * Step order is persisted as workflow order. Categories omitted by the client
 * are retained so a scoped save cannot erase configuration outside its tree.
 */
export const localSaveApprovalStepTree = async ({
  isInternal,
  actorUsername,
  payload,
}: {
  isInternal: boolean;
  actorUsername: string;
  payload: SaveServiceDeskApprovalStepTreePayload;
}) => {
  const items = getApprovalStepStore(isInternal);
  const categories = getTenantCategoriesOrThrow(items, payload.tenantId);
  const previousCategoryMap = new Map(
    categories.map((category) => [String(category.category_id), category]),
  );
  const assignId = createApprovalStepIdAssigner(items);
  const changedCategoryIds = new Set(
    payload.categories.flatMap((category) => {
      const previous = previousCategoryMap.get(category.id);
      const previousValue = JSON.stringify(
        previous?.approval_step.map(toComparableStoredStep) ?? [],
      );
      const nextValue = JSON.stringify(
        category.approvalSteps.map(toComparableSubmittedStep),
      );
      return previousValue === nextValue ? [] : [category.id];
    }),
  );
  const parentCategoryByCategoryId = buildParentCategoryMap(isInternal);
  const affectedTickets = getLocalDemoTickets().filter(
    (ticket) =>
      ticket.active !== false &&
      ticket.status === "Approval" &&
      changedCategoryIds.has(
        parentCategoryByCategoryId.get(ticket.category_id) ??
          ticket.category_id,
      ),
  );

  if (affectedTickets.length > 0 && payload.force !== true) {
    throw Object.assign(
      new Error("Approval configuration affects active tickets."),
      { code: "APPROVAL_CONFIGURATION_IMPACT", status: 409 },
    );
  }

  const synchronizedCategories = payload.categories.map(
    (category, categoryIndex) => {
      const previousCategory =
        previousCategoryMap.get(category.id) ??
        createFallbackCategory({
          categoryId: category.id,
          index: categoryIndex + 1,
        });

      const previousApprovalStepMap = new Map(
        previousCategory.approval_step.map((approvalStep) => [
          String(approvalStep.approval_step_id),
          approvalStep,
        ]),
      );
      const nextApprovalSteps = category.approvalSteps.map(
        (approvalStep, index) =>
          buildApprovalStepFromInput({
            input: {
              ...approvalStep,
              index: index + 1,
              categoryId: category.id,
            },
            assignId,
            previousApprovalStep: approvalStep.id
              ? previousApprovalStepMap.get(approvalStep.id)
              : undefined,
          }),
      );

      return {
        ...previousCategory,
        approval_step: nextApprovalSteps,
      };
    },
  );

  const submittedCategoryIds = new Set(
    synchronizedCategories.map((category) => String(category.category_id)),
  );
  const preservedCategories = categories.filter(
    (category) => !submittedCategoryIds.has(String(category.category_id)),
  );

  items[payload.tenantId] = [...synchronizedCategories, ...preservedCategories];
  replaceLocalDemoApprovalStepCategories({
    tenantId: payload.tenantId,
    categoryIds: categories.map((category) => category.category_id),
    categories: items[payload.tenantId],
  });

  if (affectedTickets.length > 0) {
    const previousTickets = structuredClone(affectedTickets);
    const histories = getLocalDemoHistories();
    const previousHistoryLength = histories.length;

    try {
      for (const ticket of affectedTickets) {
        const routing = await resolveCreateTicketRouting({
          isInternal,
          categoryId: ticket.category_id,
          parentCategoryId:
            parentCategoryByCategoryId.get(ticket.category_id) ??
            ticket.category_id,
          requesterUsername: ticket.requester_username,
        });
        const previousApprovalStepId = ticket.approval_step_id;
        const previousAssignees = ticket.assignee_usernames.slice();
        ticket.status = routing.status;
        ticket.approval_step_id = routing.approvalStepId;
        ticket.assignee_usernames = routing.assigneeUsernames;
        ticket.assignment_phase =
          routing.approvalStepId === null ? "WORK" : "APPROVAL";
        ticket.approval_assignee_usernames =
          routing.approvalStepId === null ? [] : routing.assigneeUsernames;
        ticket.work_assignee_usernames =
          routing.approvalStepId === null ? routing.assigneeUsernames : [];
        ticket.updated_at = new Date().toISOString();
        histories.push({
          ticket_id: ticket.id,
          history_no:
            Math.max(
              0,
              ...histories
                .filter((history) => history.ticket_id === ticket.id)
                .map((history) => history.history_no),
            ) + 1,
          type: "TICKET",
          source: "APPROVAL_RULE",
          event: "ROUTING_RESET",
          actor_username: actorUsername,
          action_no: null,
          from_value: {
            approvalStepId: previousApprovalStepId,
            assigneeUsernames: previousAssignees,
          },
          to_value: {
            approvalStepId: routing.approvalStepId,
            assigneeUsernames: routing.assigneeUsernames,
          },
          metadata: { reason: "APPROVAL_CONFIGURATION_CHANGED" },
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      replaceLocalDemoApprovalStepCategories({
        tenantId: payload.tenantId,
        categoryIds: categories.map((category) => category.category_id),
        categories,
      });
      for (const previous of previousTickets) {
        const index = getLocalDemoTickets().findIndex(
          (ticket) => ticket.id === previous.id,
        );
        if (index >= 0) getLocalDemoTickets().splice(index, 1, previous);
      }
      histories.splice(previousHistoryLength);
      throw error;
    }
  }

  return normalizeCategoryApprovalSettings(items[payload.tenantId]);
};

function buildParentCategoryMap(isInternal: boolean) {
  const result = new Map<string, string>();
  for (const tenant of getLocalDemoCategories(isInternal)) {
    for (const category of tenant.category) {
      const mainId = String(category.category_id);
      result.set(mainId, mainId);
      for (const subCategory of category.sub_category) {
        result.set(String(subCategory.category_id), mainId);
      }
    }
  }
  return result;
}

function toComparableStoredStep(step: LocalDbApprovalStep) {
  return {
    id: String(step.approval_step_id),
    assignee: step.approval_step_assignee,
    skipAccessLevel: step.skip_access_level,
  };
}

function toComparableSubmittedStep(
  step: SaveServiceDeskApprovalStepTreePayload["categories"][number]["approvalSteps"][number],
) {
  const assignee =
    step.stepAssignee.type === "MANAGER"
      ? { type: "MANAGER" as const, level: step.stepAssignee.managerDistance }
      : step.stepAssignee.type === "DEPARTMENT"
        ? {
            type: "DEPARTMENT" as const,
            department_id: Number(step.stepAssignee.departmentId),
          }
        : step.stepAssignee.type === "JOB_FIELD"
          ? {
              type: "JOB_FIELD" as const,
              field_id: Number(step.stepAssignee.jobFieldId),
            }
          : {
              type: "EMPLOYEE" as const,
              employee_username: step.stepAssignee.employeeUsernames.map(String),
            };
  return {
    id: step.id ?? null,
    assignee,
    skipAccessLevel: step.skipAccessLevel ?? null,
  };
}
