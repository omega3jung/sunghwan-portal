import { describe, expect, it } from "vitest";

import {
  buildDbSearchParams,
  combineRuleGroups,
  createArrayContainsAnyFilter,
  createDateRangeFilter,
  createEqualsAnyFilter,
  createFieldFilter,
  createKeywordFilter,
  joinRuleGroups,
  toIsoString,
} from "./params";

describe("routing database filters", () => {
  it("omits empty scalar, list, keyword, and date filters", () => {
    expect(createFieldFilter({ field: "status", value: "  " })).toBeUndefined();
    expect(createEqualsAnyFilter({ field: "status", values: [""] })).toBeUndefined();
    expect(
      createArrayContainsAnyFilter({ field: "assignees", values: [] }),
    ).toBeUndefined();
    expect(createKeywordFilter({ fields: ["subject"], keyword: " " })).toBeUndefined();
    expect(
      createDateRangeFilter({
        field: "createdAt",
        dateRange: { from: "invalid", to: null },
      }),
    ).toBeUndefined();
  });

  it("creates nested OR filters for keyword and array containment", () => {
    expect(
      createKeywordFilter({ fields: ["number", "subject"], keyword: "  VPN  " }),
    ).toEqual({
      rules: [
        { rules: [{ field: "number", operator: "contains", value: "VPN" }] },
        "or",
        { rules: [{ field: "subject", operator: "contains", value: "VPN" }] },
      ],
    });
    expect(
      createArrayContainsAnyFilter({
        field: "assigneeUsernames",
        values: ["worker-a", "", "worker-b"],
      }),
    ).toEqual({
      rules: [
        {
          rules: [
            {
              field: "assigneeUsernames",
              operator: "contains",
              value: "worker-a",
            },
          ],
        },
        "or",
        {
          rules: [
            {
              field: "assigneeUsernames",
              operator: "contains",
              value: "worker-b",
            },
          ],
        },
      ],
    });
  });

  it("combines only present groups using interleaved combinators", () => {
    const active = createFieldFilter({ field: "active", value: true });
    const status = createEqualsAnyFilter({
      field: "status",
      values: ["Assigned", "Working"],
    });

    expect(combineRuleGroups([undefined, active, undefined, status])).toEqual({
      rules: [active, "and", status],
    });
    expect(joinRuleGroups([], "or")).toBeUndefined();
  });

  it("creates inclusive ISO date boundaries and ignores invalid values", () => {
    expect(
      createDateRangeFilter({
        field: "dueAt",
        dateRange: {
          from: new Date("2026-01-01T00:00:00.000Z"),
          to: "2026-01-31T23:59:59.000Z",
        },
      }),
    ).toEqual({
      rules: [
        {
          rules: [
            {
              field: "dueAt",
              operator: ">=",
              value: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
        "and",
        {
          rules: [
            {
              field: "dueAt",
              operator: "<=",
              value: "2026-01-31T23:59:59.000Z",
            },
          ],
        },
      ],
    });
    expect(toIsoString("not-a-date")).toBeUndefined();
  });

  it("serializes a nested filter and supported scalar/date parameters", () => {
    const filter = createFieldFilter({ field: "subject", value: "한글 & VPN" });
    const params = buildDbSearchParams({
      filter,
      page: 2,
      includeClosed: false,
      from: new Date("2026-02-01T00:00:00.000Z"),
      ignored: { nested: true },
      absent: null,
    });

    expect(JSON.parse(params.get("filter") ?? "null")).toEqual(filter);
    expect(params.get("page")).toBe("2");
    expect(params.get("includeClosed")).toBe("false");
    expect(params.get("from")).toBe("2026-02-01T00:00:00.000Z");
    expect(params.has("ignored")).toBe(false);
    expect(params.has("absent")).toBe(false);
    expect(params.toString()).toContain("%ED%95%9C%EA%B8%80");
  });
});
