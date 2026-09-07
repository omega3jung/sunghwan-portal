import { describe, expect, it } from "vitest";

import { filterItemsByQuery, getFilterRules } from "./filterItemsByQuery";

const items = [
  { id: "1", status: "Working", owner: { username: "alice" } },
  { id: "2", status: "Pending", owner: { username: "bob" } },
  { id: "3", status: "Resolved", owner: { username: "carol" } },
];

describe("query filter compatibility", () => {
  it("reconstructs legacy indexed rules in numeric order", () => {
    const params = new URLSearchParams({
      "filter[rules][10][field]": "owner.username",
      "filter[rules][10][operator]": "contains",
      "filter[rules][10][value]": "ali",
      "filter[rules][2][field]": "status",
      "filter[rules][2][operator]": "=",
      "filter[rules][2][value]": "Working",
      page: "1",
    });

    expect(getFilterRules(params)).toEqual([
      { field: "status", operator: "=", value: "Working" },
      { field: "owner.username", operator: "contains", value: "ali" },
    ]);
    expect(filterItemsByQuery(params, items)).toEqual([items[0]]);
  });

  it("prefers the serialized rule group when both formats are present", () => {
    const params = new URLSearchParams({
      filter: JSON.stringify({
        rules: [{ field: "status", operator: "=", value: "Resolved" }],
      }),
      "filter[rules][0][field]": "status",
      "filter[rules][0][operator]": "=",
      "filter[rules][0][value]": "Working",
    });

    expect(filterItemsByQuery(params, items)).toEqual([items[2]]);
  });
});
