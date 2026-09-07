import { describe, expect, it } from "vitest";

import type { TicketSearchCriteriaFormValues } from "./forms";
import {
  mapSearchCriteriaToDbParams,
  normalizeTicketSearchCriteriaFormValues,
} from "./utils";

const criteria = (
  overrides: Partial<TicketSearchCriteriaFormValues> = {},
): TicketSearchCriteriaFormValues => ({
  cat_scope: "PORTAL",
  category: [],
  status: [],
  riskLevel: [],
  assignee: [],
  requester: [],
  period: {
    type: "custom",
    dateRange: {
      from: new Date("2026-01-01T00:00:00.000Z"),
      to: new Date("2026-01-31T23:59:59.000Z"),
    },
  },
  dueBy: { type: "all", dateRange: undefined },
  priority: [],
  keyword: "",
  ...overrides,
});

describe("ticket search criteria mapping", () => {
  it("normalizes legacy status values before persistence", () => {
    expect(
      normalizeTicketSearchCriteriaFormValues(
        criteria({
          status: ["Approved", "Reopen", "Unknown"] as never,
        }),
      ).status,
    ).toEqual(["Assigned", "Working"]);
  });

  it("combines active, scope, keyword, list, assignee, and date criteria", () => {
    const result = mapSearchCriteriaToDbParams(
      criteria({
        keyword: " VPN ",
        category: ["10"],
        status: ["Open"],
        riskLevel: ["High"],
        priority: ["Urgent"],
        assignee: ["worker"],
        requester: ["requester"],
        dueBy: {
          type: "custom",
          dateRange: {
            from: new Date("2026-02-01T00:00:00.000Z"),
            to: new Date("2026-02-28T23:59:59.000Z"),
          },
        },
      }),
    );
    const serialized = JSON.stringify(result.filter);

    expect(result.filter?.rules).toContain("and");
    expect(serialized).toContain('"field":"active"');
    expect(serialized).toContain('"field":"cat_scope"');
    expect(serialized).toContain('"value":"VPN"');
    expect(serialized).toContain('"field":"categoryId"');
    expect(serialized).toContain('"value":"Approval"');
    expect(serialized).toContain('"field":"assigneeUsernames"');
    expect(serialized).toContain('"operator":"contains"');
    expect(serialized).toContain('"field":"createdAt"');
    expect(serialized).toContain('"field":"dueAt"');
  });

  it("omits empty optional criteria while retaining the mandatory active filter", () => {
    const result = mapSearchCriteriaToDbParams(
      criteria({
        cat_scope: undefined,
        period: {
          type: "custom",
          dateRange: {
            from: new Date(Number.NaN),
            to: new Date(Number.NaN),
          },
        },
      }),
    );

    expect(result.filter).toEqual({
      rules: [{ rules: [{ field: "active", operator: "=", value: true }] }],
    });
  });
});
