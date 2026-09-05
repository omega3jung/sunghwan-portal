import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";
import { ticketsMock } from "@/mocks/scenarios/serviceDesk/ticketsMock";

import { localSearchTickets } from "./search";
import { resetLocalDemoTicketState } from "./state";

const person = (username: string) => ({
  username,
  name: {
    en: { first: username, middle: "", last: "User" },
    ko: { first: username, middle: "", last: "사용자" },
  },
  image: null,
});

const ticket = (
  id: string,
  overrides: Partial<DbTicketDetail>,
): DbTicketDetail => ({
  ...structuredClone(ticketsMock[0]),
  id,
  ticket_number: `SD-${id}`,
  tenant_id: "7",
  scope: "INTERNAL",
  active: true,
  requester_username: `requester-${id}`,
  requester: {
    ...person(`requester-${id}`),
    email: `requester-${id}@example.com`,
  },
  assignment_phase: "WORK",
  approval_step_id: null,
  approval_assignees: [],
  approval_assignee_usernames: [],
  work_assignees: [person(`worker-${id}`)],
  work_assignee_usernames: [`worker-${id}`],
  assignees: [person(`worker-${id}`)],
  assignee_usernames: [`worker-${id}`],
  ...overrides,
});

const baseRequest = {
  page: 1,
  pageSize: 20,
  filter: undefined,
  sortField: undefined,
  sortDirection: undefined,
} as const;

describe("localSearchTickets", () => {
  beforeEach(() => {
    globalThis.__SP_LOCAL_DEMO_TICKET_STATE__ = {
      tickets: [
        ticket("10", {
          scope: "PORTAL",
          status: "Resolved",
          priority: "low",
          requester_username: "zoe",
          requester: { ...person("zoe"), email: "zoe@example.com" },
          assignment_phase: "APPROVAL",
          approval_step_id: "3",
          approval_assignees: [person("approver")],
          approval_assignee_usernames: ["approver"],
          work_assignees: [],
          work_assignee_usernames: [],
        }),
        ticket("2", {
          status: "Working",
          priority: "urgent",
          requester_username: "amy",
          requester: { ...person("amy"), email: "amy@example.com" },
          work_assignees: [person("worker")],
          work_assignee_usernames: ["worker"],
        }),
        ticket("30", { tenant_id: "8", scope: "INTERNAL" }),
        ticket("40", { active: false }),
      ],
      actions: [],
      histories: [],
    };
  });

  afterEach(() => resetLocalDemoTicketState());

  it("applies access and active boundaries before returning tickets", () => {
    const result = localSearchTickets({
      access: { username: "viewer", userScope: "CLIENT", tenantId: "7" },
      request: baseRequest,
    });

    expect(result.items.map(({ id }) => id)).toEqual(["10", "2"]);
    expect(result.totalCount).toBe(2);
  });

  it("allows an INTERNAL principal to see another tenant's PORTAL ticket only", () => {
    const result = localSearchTickets({
      access: { username: "internal", userScope: "INTERNAL", tenantId: "99" },
      request: baseRequest,
    });

    expect(result.items.map(({ id }) => id)).toEqual(["10"]);
  });

  it("filters, sorts, and paginates in the same order as the remote search contract", () => {
    const result = localSearchTickets({
      access: { username: "viewer", userScope: "CLIENT", tenantId: "7" },
      request: {
        ...baseRequest,
        pageSize: 1,
        sortField: "ticketNumber",
        sortDirection: "asc",
        filter: {
          rules: [
            { field: "status", operator: "in", value: "Working, Resolved" },
          ],
        },
      },
    });

    expect(result.items.map(({ id }) => id)).toEqual(["2"]);
    expect(result.totalCount).toBe(2);
    expect(result).toMatchObject({ page: 1, pageSize: 1 });
  });

  it("builds unique sorted facets from the filtered set before pagination and current phase", () => {
    const result = localSearchTickets({
      access: { username: "viewer", userScope: "CLIENT", tenantId: "7" },
      request: {
        ...baseRequest,
        pageSize: 1,
        sortField: "ticketNumber",
        sortDirection: "asc",
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.facets.requesters.map(({ username }) => username)).toEqual([
      "amy",
      "zoe",
    ]);
    expect(result.facets.assignees.map(({ username }) => username)).toEqual([
      "approver",
      "worker",
    ]);
  });
});
