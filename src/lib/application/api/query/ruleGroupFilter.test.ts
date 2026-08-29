import { describe, expect, it } from "vitest";

import {
  applyRuleGroupFilter,
  getBooleanRuleGroupValue,
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "./ruleGroupFilter";

const tickets = [
  {
    id: "1",
    status: "Working",
    active: true,
    priority: 4,
    requester: { username: "alice" },
    tags: ["customer", "urgent"],
    dueAt: "2026-08-30T00:00:00.000Z",
  },
  {
    id: "2",
    status: "Pending",
    active: false,
    priority: 2,
    requester: { username: "bob" },
    tags: ["internal"],
    dueAt: "2026-09-05T00:00:00.000Z",
  },
  {
    id: "3",
    status: "Resolved",
    active: true,
    priority: 1,
    requester: { username: "carol" },
    tags: [],
    dueAt: "2026-09-10T00:00:00.000Z",
  },
];

describe("rule group filter", () => {
  it("evaluates nested groups, connectors, and nested fields", () => {
    const filter = {
      rules: [
        { field: "active", operator: "=", value: true },
        "and",
        {
          rules: [
            { field: "requester.username", operator: "=", value: "alice" },
            "or",
            { field: "status", operator: "=", value: "Resolved" },
          ],
        },
      ],
    };

    expect(applyRuleGroupFilter(tickets, filter).map(({ id }) => id)).toEqual([
      "1",
      "3",
    ]);
  });

  it("supports collection, comparison, and serialized filter values", () => {
    const serialized = JSON.stringify({
      rules: [
        { field: "tags", operator: "contains", value: "urgent" },
        "and",
        { field: "priority", operator: ">=", value: 4 },
        "and",
        {
          field: "dueAt",
          operator: "<",
          value: "2026-09-01T00:00:00.000Z",
        },
      ],
    });

    expect(applyRuleGroupFilter(tickets, serialized)).toEqual([tickets[0]]);
    expect(
      applyRuleGroupFilter(tickets, {
        rules: [{ field: "status", operator: "in", value: "Pending, Resolved" }],
      }).map(({ id }) => id),
    ).toEqual(["2", "3"]);
  });

  it("degrades malformed and incomplete input to a no-op", () => {
    expect(parseRuleGroupFilter("{not-json")).toBeUndefined();
    expect(applyRuleGroupFilter(tickets, "{not-json")).toBe(tickets);
    expect(
      applyRuleGroupFilter(tickets, {
        rules: [{ field: "status" }, "and", null],
      }),
    ).toEqual(tickets);
  });

  it("extracts the first explicit boolean and trimmed string rule", () => {
    const filter = JSON.stringify({
      rules: [
        { field: "active", operator: "!=", value: false },
        "and",
        {
          rules: [
            { field: "active", operator: "=", value: "true" },
            "and",
            { field: "requester", operator: "=", value: "  alice  " },
          ],
        },
      ],
    });

    expect(getBooleanRuleGroupValue(filter, "active")).toBe(true);
    expect(getStringRuleGroupValue(filter, "requester")).toBe("alice");
    expect(getStringRuleGroupValue(filter, "missing")).toBeNull();
  });
});
