import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryPortalApi } = vi.hoisted(() => ({
  queryPortalApi: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/server/shared/supabase/portalApiClient", () => ({
  queryPortalApi,
}));

import {
  findActiveTicketViewRowById,
  findActiveTicketViewRows,
  findActiveTicketViewRowsBySearch,
} from "./ticketRepository";

const principal = {
  username: "reader",
  companyId: 11,
  userScope: "CLIENT" as const,
};

describe("REMOTE ticket read predicate", () => {
  beforeEach(() => queryPortalApi.mockClear());

  it("applies requester, assignee, tenant, and cat_scope authorization to list and detail", async () => {
    await findActiveTicketViewRows(principal);
    await findActiveTicketViewRowById("ticket-1", {}, principal);

    for (const [sql, values] of queryPortalApi.mock.calls) {
      expect(sql).toContain("ticket_view.tk_requester_username");
      expect(sql).toContain("ticket_view.tk_assignee_usernames");
      expect(sql).toContain("authorization_tenant.tn_company_id");
      expect(sql).toContain("ticket_view.cat_scope = 'PORTAL'");
      expect(values).toEqual(expect.arrayContaining(["reader", 11, "CLIENT"]));
    }
  });

  it("reuses the authorization predicate for rows, count, and search facets", async () => {
    await findActiveTicketViewRowsBySearch(
      { page: 1, pageSize: 20 },
      principal,
    );

    expect(queryPortalApi).toHaveBeenCalledTimes(4);
    for (const [sql] of queryPortalApi.mock.calls) {
      expect(sql).toContain("ticket_view.cat_scope = 'PORTAL'");
      expect(sql).toContain("authorization_tenant.tn_company_id");
    }
  });

  it("applies the cat_scope filter to every REMOTE search query", async () => {
    await findActiveTicketViewRowsBySearch(
      {
        filter: {
          rules: [
            { rules: [{ field: "active", operator: "=", value: true }] },
            "and",
            {
              rules: [
                { field: "cat_scope", operator: "=", value: "INTERNAL" },
              ],
            },
          ],
        },
        page: 1,
        pageSize: 10,
      },
      principal,
    );

    expect(queryPortalApi).toHaveBeenCalledTimes(4);
    for (const [sql, values] of queryPortalApi.mock.calls) {
      expect(sql).toContain("ticket_view.cat_scope = $5");
      expect(values).toEqual(expect.arrayContaining(["INTERNAL"]));
    }
  });
});
