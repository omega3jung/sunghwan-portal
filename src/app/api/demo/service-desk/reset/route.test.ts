import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthToken: vi.fn(),
  resetSettings: vi.fn(),
  resetTickets: vi.fn(),
  resetWorkSessions: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getAuthToken: mocks.getAuthToken,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/settings/state", () => ({
  resetLocalDemoSettingsState: mocks.resetSettings,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket/state", () => ({
  resetLocalDemoTicketState: mocks.resetTickets,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket/workSession", () => ({
  resetLocalTicketWorkSessionState: mocks.resetWorkSessions,
}));

import { POST } from "./route";

describe("POST /api/demo/service-desk/reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unauthenticated request without changing demo state", async () => {
    mocks.getAuthToken.mockResolvedValue(null);

    const response = await POST(createRequest());

    expect(response.status).toBe(401);
    expectResetFunctionsNotToHaveBeenCalled();
  });

  it("rejects a REMOTE session without changing demo state", async () => {
    mocks.getAuthToken.mockResolvedValue({ dataScope: "REMOTE" });

    const response = await POST(createRequest());

    expect(response.status).toBe(403);
    expectResetFunctionsNotToHaveBeenCalled();
  });

  it("resets all mutable demo state for a LOCAL session", async () => {
    mocks.getAuthToken.mockResolvedValue({ dataScope: "LOCAL" });

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    expect(mocks.resetTickets).toHaveBeenCalledOnce();
    expect(mocks.resetWorkSessions).toHaveBeenCalledOnce();
    expect(mocks.resetSettings).toHaveBeenCalledOnce();
  });
});

function createRequest() {
  return new NextRequest("http://localhost/api/demo/service-desk/reset", {
    method: "POST",
  });
}

function expectResetFunctionsNotToHaveBeenCalled() {
  expect(mocks.resetTickets).not.toHaveBeenCalled();
  expect(mocks.resetWorkSessions).not.toHaveBeenCalled();
  expect(mocks.resetSettings).not.toHaveBeenCalled();
}
