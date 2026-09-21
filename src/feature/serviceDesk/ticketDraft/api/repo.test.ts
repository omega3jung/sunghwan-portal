// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn(), get: vi.fn() }));
vi.mock("./api", () => ({ serviceDeskTicketDraftApi: api }));
vi.mock("@/feature/auth/session/client", () => ({ useCurrentSession: vi.fn() }));

import type { TicketDraftFormPayload } from "./mapper";
import { serviceDeskTicketDraftRepo as repo } from "./repo";

const data: TicketDraftFormPayload = {
  id: null, category: "10", subject: "", body: "",
  dueAt: new Date("2099-01-01"), priority: "medium", riskLevel: "medium",
  email: { to: [], cc: [], bcc: [] },
  requester: { id: "requester", name: "Requester", email: "" }, attachment: [],
};
const key = "sunghwan_portal_ticket_draft";

describe.each(["LOCAL", "REMOTE"] as const)("%s category-first draft storage", (dataScope) => {
  const context = { userId: "requester", dataScope };
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    api.create.mockImplementation(async (value) => value);
    api.update.mockImplementation(async (value) => value);
  });

  it.each(["create", "update"] as const)("rejects %s without a category before storage or API calls", async (operation) => {
    await expect(repo[operation]({ ...context, data: { ...data, category: undefined, subject: "Unsaved text" } })).rejects.toThrow();
    expect(localStorage.getItem(key)).toBeNull();
    expect(api.create).not.toHaveBeenCalled();
    expect(api.update).not.toHaveBeenCalled();
  });

  it("saves category-only content and updates only the subject", async () => {
    await expect(repo.create({ ...context, data })).resolves.toMatchObject({ category: "10", subject: "", body: "" });
    const updated = { ...data, subject: "Started" };
    await repo.update({ ...context, data: updated });
    if (dataScope === "LOCAL") {
      expect(JSON.parse(localStorage.getItem(key)!)).toMatchObject({ form: { category: "10", subject: "Started", body: "" } });
      expect(api.create).not.toHaveBeenCalled();
      expect(api.update).not.toHaveBeenCalled();
    } else {
      expect(api.create).toHaveBeenCalledWith(data);
      expect(api.update).toHaveBeenCalledWith(updated);
      expect(localStorage.getItem(key)).toBeNull();
    }
  });
});
