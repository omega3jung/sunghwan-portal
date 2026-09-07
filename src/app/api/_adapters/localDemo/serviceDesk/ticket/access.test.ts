import { describe, expect, it } from "vitest";

import { canAccessLocalDemoTicket } from "./access";

const ticket = {
  tenant_id: "11",
  scope: "INTERNAL" as const,
  requester_username: "requester",
  assignee_usernames: ["worker"],
};

describe("LOCAL ticket read authorization", () => {
  it("allows tenant members, requester, current assignee, and INTERNAL PORTAL readers", () => {
    expect(
      canAccessLocalDemoTicket(ticket, {
        username: "tenant-user",
        tenantId: "11",
        userScope: "CLIENT",
      }),
    ).toBe(true);
    expect(
      canAccessLocalDemoTicket(ticket, {
        username: "requester",
        tenantId: "13",
        userScope: "CLIENT",
      }),
    ).toBe(true);
    expect(
      canAccessLocalDemoTicket(ticket, {
        username: "worker",
        tenantId: "13",
        userScope: "CLIENT",
      }),
    ).toBe(true);
    expect(
      canAccessLocalDemoTicket(
        { ...ticket, scope: "PORTAL" },
        {
          username: "provider",
          tenantId: "1",
          userScope: "INTERNAL",
        },
      ),
    ).toBe(true);
  });

  it("denies unrelated cross-tenant INTERNAL tickets", () => {
    expect(
      canAccessLocalDemoTicket(ticket, {
        username: "other",
        tenantId: "13",
        userScope: "CLIENT",
      }),
    ).toBe(false);
  });

  it("matches the INTERNAL / PORTAL cross-tenant matrix", () => {
    expect(
      canAccessLocalDemoTicket(
        { ...ticket, scope: "PORTAL" },
        {
          username: "provider",
          tenantId: "1",
          userScope: "INTERNAL",
        },
      ),
    ).toBe(true);
    expect(
      canAccessLocalDemoTicket(
        { ...ticket, scope: "INTERNAL" },
        {
          username: "provider",
          tenantId: "1",
          userScope: "INTERNAL",
        },
      ),
    ).toBe(false);
    expect(
      canAccessLocalDemoTicket(
        { ...ticket, scope: "PORTAL" },
        {
          username: "other-client",
          tenantId: "13",
          userScope: "CLIENT",
        },
      ),
    ).toBe(false);
  });
});
