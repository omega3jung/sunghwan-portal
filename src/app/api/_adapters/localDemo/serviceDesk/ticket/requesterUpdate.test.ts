import { afterEach, describe, expect, it } from "vitest";

import type { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { allEmployeesMock } from "@/mocks/domain/organization/employee";

import { getLocalDemoCategories } from "../settings/state";
import { resolveCreateTicketRouting } from "./createRouting";
import { localRequesterUpdateTicket } from "./requesterUpdate";
import {
  getLocalDemoHistories,
  getLocalDemoTickets,
  resetLocalDemoTicketState,
} from "./state";

afterEach(resetLocalDemoTicketState);

function installRequesterEditableTicket(ticket: DbTicketDetail) {
  const editableTicket: DbTicketDetail = {
    ...structuredClone(ticket),
    id: "local-requester-update-ticket",
    status: "Assigned",
    assignment_phase: "WORK",
    approval_step_id: null,
    approval_assignee_usernames: [],
    work_assignee_usernames: [...ticket.assignee_usernames],
    active: true,
  };

  getLocalDemoTickets().splice(
    0,
    getLocalDemoTickets().length,
    editableTicket,
  );
  return editableTicket;
}

function updateInput(ticket: DbTicketDetail) {
  return {
    categoryId: ticket.category_id,
    subject: ticket.subject,
    content: ticket.content,
    dueAt: ticket.due_at,
    email: ticket.email,
    files: ticket.files,
    images: ticket.images,
  };
}

function accessFor(ticket: DbTicketDetail) {
  return {
    username: ticket.requester_username,
    userScope: "CLIENT" as const,
    tenantId: String(ticket.tenant_id),
  };
}

async function findRoutableClientSetup() {
  for (const tenant of getLocalDemoCategories(false)) {
    const requester = allEmployeesMock.find(
      (employee) =>
        String(employee.e_company_id) === String(tenant.tenant_company_id),
    );

    if (!requester) {
      continue;
    }

    for (const mainCategory of tenant.category) {
      const categories = [mainCategory, ...mainCategory.sub_category];

      for (const category of categories) {
        if (!mainCategory.category_active || !category.category_active) {
          continue;
        }

        try {
          const routing = await resolveCreateTicketRouting({
            isInternal: false,
            categoryId: String(category.category_id),
            parentCategoryId: String(mainCategory.category_id),
            requesterUsername: requester.e_username,
          });
          const ticket: DbTicketDetail = {
            ...structuredClone(getLocalDemoTickets()[0]),
            tenant_id: String(tenant.tenant_id),
            tenant_name: tenant.tenant_name,
            requester_username: requester.e_username,
            scope: mainCategory.category_scope,
            category_id: String(category.category_id),
            category_name: category.category_name,
            category_parent_id:
              category === mainCategory
                ? null
                : String(mainCategory.category_id),
          };

          return { ticket, routing };
        } catch {
          // Some fixtures intentionally represent broken routing.
        }
      }
    }
  }

  throw new Error("Expected at least one routable client category fixture.");
}

describe("LOCAL requester ticket update workflow", () => {
  it("preserves routing for a due-date-only edit and records that decision", async () => {
    const setup = await findRoutableClientSetup();
    const ticket = installRequesterEditableTicket(setup.ticket);
    const previousRouting = {
      status: ticket.status,
      approvalStepId: ticket.approval_step_id,
      assigneeUsernames: ticket.assignee_usernames,
    };

    await localRequesterUpdateTicket({
      isInternal: false,
      access: accessFor(ticket),
      ticketId: ticket.id,
      requesterUsername: ticket.requester_username,
      input: {
        ...updateInput(ticket),
        dueAt: "2099-12-31T00:00:00.000Z",
      },
    });

    expect(getLocalDemoTickets()[0]).toMatchObject({
      status: previousRouting.status,
      approval_step_id: previousRouting.approvalStepId,
      assignee_usernames: previousRouting.assigneeUsernames,
      due_at: "2099-12-31T00:00:00.000Z",
    });
    expect(getLocalDemoHistories().at(-1)).toMatchObject({
      ticket_id: ticket.id,
      event: "ROUTING_PRESERVED",
      actor_username: ticket.requester_username,
      metadata: expect.objectContaining({
        changedFields: ["dueAt"],
        routingSensitiveChanged: false,
        preservedRouting: true,
      }),
    });
  });

  it("restarts routing when the requester changes workflow-sensitive content", async () => {
    const setup = await findRoutableClientSetup();
    const ticket = installRequesterEditableTicket(setup.ticket);
    const expectedRouting = setup.routing;

    await localRequesterUpdateTicket({
      isInternal: false,
      access: accessFor(ticket),
      ticketId: ticket.id,
      requesterUsername: ticket.requester_username,
      input: {
        ...updateInput(ticket),
        subject: `${ticket.subject} (updated)`,
      },
    });

    expect(getLocalDemoTickets()[0]).toMatchObject({
      status: expectedRouting.status,
      approval_step_id: expectedRouting.approvalStepId,
      assignee_usernames: expectedRouting.assigneeUsernames,
    });
    expect(getLocalDemoHistories().at(-1)).toMatchObject({
      event: "ROUTING_RESET",
      metadata: expect.objectContaining({
        changedFields: ["subject"],
        routingSensitiveChanged: true,
        routingReset: true,
        nextApprovalStepId: expectedRouting.approvalStepId,
        nextAssigneeUsernames: expectedRouting.assigneeUsernames,
      }),
    });
  });

  it("checks requester ownership before mutating ticket or history state", async () => {
    const setup = await findRoutableClientSetup();
    const ticket = installRequesterEditableTicket(setup.ticket);
    const ticketsBefore = structuredClone(getLocalDemoTickets());
    const historiesBefore = structuredClone(getLocalDemoHistories());

    await expect(
      localRequesterUpdateTicket({
        isInternal: false,
        access: {
          ...accessFor(ticket),
          username: "other-user",
        },
        ticketId: ticket.id,
        requesterUsername: "other-user",
        input: {
          ...updateInput(ticket),
          dueAt: "2099-12-31T00:00:00.000Z",
        },
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(getLocalDemoTickets()).toEqual(ticketsBefore);
    expect(getLocalDemoHistories()).toEqual(historiesBefore);
  });
});
