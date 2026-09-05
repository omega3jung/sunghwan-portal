import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isRemoteRequest: vi.fn(),
  portalApiJson: vi.fn(),
  tickets: [] as Array<Record<string, unknown>>,
  histories: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/app/api/_adapters", () => ({ isRemoteRequest: mocks.isRemoteRequest }));
vi.mock("@/app/api/_adapters/backend", () => ({ portalApiJson: mocks.portalApiJson }));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket/state", () => ({
  getLocalDemoTickets: () => mocks.tickets,
  getLocalDemoHistories: () => mocks.histories,
}));
vi.mock("@/app/api/_adapters/serviceDesk", () => ({
  resolveApiErrorMessage: (key: string) => key,
}));

import { GET, POST } from "./route";

const now = new Date("2026-09-04T00:00:00.000Z");

describe("Resolved-ticket auto-close route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(now);
    process.env.SERVICE_DESK_CRON_SECRET = "cron-secret";
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.tickets.length = 0;
    mocks.histories.length = 0;
  });
  afterEach(() => {
    vi.useRealTimers();
    delete process.env.SERVICE_DESK_CRON_SECRET;
    delete process.env.CRON_SECRET;
  });

  it("rejects missing or invalid cron credentials", async () => {
    delete process.env.SERVICE_DESK_CRON_SECRET;
    expect((await POST(createRequest())).status).toBe(500);

    process.env.SERVICE_DESK_CRON_SECRET = "cron-secret";
    expect((await POST(createRequest("wrong"))).status).toBe(401);
    expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
  });

  it.each([
    ["Bearer", { authorization: "Bearer cron-secret" }],
    ["x-cron-secret", { "x-cron-secret": "cron-secret" }],
  ])("accepts %s credentials", async (_label, headers) => {
    const response = await GET(createRequest(undefined, headers));
    expect(response.status).toBe(200);
  });

  it("closes a Resolved ticket exactly at the cutoff and records SYSTEM_AUTO history", async () => {
    mocks.tickets.push(
      createTicket("expired", "Resolved"),
      createTicket("recent", "Resolved"),
      createTicket("working", "Working"),
    );
    mocks.histories.push(
      createResolvedHistory("expired", "2026-08-28T00:00:00.000Z"),
      createResolvedHistory("recent", "2026-08-28T00:00:00.001Z"),
    );

    const response = await POST(createRequest("cron-secret"));

    await expect(response.json()).resolves.toEqual({
      closedCount: 1,
      ticketIds: ["expired"],
    });
    expect(mocks.tickets.find((ticket) => ticket.id === "expired")?.status).toBe("Closed");
    expect(mocks.tickets.find((ticket) => ticket.id === "recent")?.status).toBe("Resolved");
    expect(mocks.histories.at(-1)).toMatchObject({
      ticket_id: "expired",
      event: "RESOLUTION_CLOSE",
      source: "SYSTEM_AUTO",
      actor_username: null,
      from_value: { status: "Resolved" },
      to_value: { status: "Closed", closeReason: "Completed" },
    });
  });

  it("proxies the authorized workflow in REMOTE mode", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 204 }));

    await POST(createRequest("cron-secret"));

    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        path: "/service-desk/cron/tickets/close-expired-resolved",
        body: {},
      }),
    );
  });
});

function createRequest(secret?: string, headers: Record<string, string> = {}) {
  return new NextRequest(
    "http://localhost/api/service-desk/cron/tickets/close-expired-resolved",
    { headers: { ...(secret ? { "x-cron-secret": secret } : {}), ...headers } },
  );
}

function createTicket(id: string, status: string) {
  return {
    id,
    status,
    close_reason: null,
    updated_at: "2026-08-01T00:00:00.000Z",
  };
}

function createResolvedHistory(ticketId: string, createdAt: string) {
  return {
    ticket_id: ticketId,
    history_no: 1,
    to_value: { status: "Resolved" },
    created_at: createdAt,
  };
}
