import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  createTicketHistoryRow: vi.fn(),
  findTicketHistoryRowsByTicketId: vi.fn(),
}));

vi.mock("./ticketHistoryRepository", () => repository);

import {
  createTicketHistory,
  getTicketHistoriesByTicketId,
} from "./ticketHistoryService";

const row = (historyNo = 1) => ({
  tkh_ticket_id: "ticket-1",
  tkh_history_no: historyNo,
  tkh_action_no: 2,
  tkh_history_type: "COMMENT",
  tkh_source: "USER_ACTION",
  tkh_event: "COMMENT_CREATED",
  tkh_actor_username: "worker",
  tkh_actor_name: { en: "Worker" },
  tkh_from_value: null,
  tkh_to_value: { content: "updated" },
  tkh_metadata: { source: "USER_ACTION", event: "COMMENT_CREATED", label: "ok" },
  tkh_created_at: "2026-01-02T03:04:05.000Z",
});

const input = {
  ticketId: "ticket-1",
  actionNo: 2,
  historyType: "COMMENT" as const,
  source: "USER_ACTION" as const,
  event: "COMMENT_CREATED" as const,
  actorUsername: "worker",
  toValue: { content: "updated" },
  metadata: {
    source: "SYSTEM_AUTO",
    event: "STATUS_UPDATED",
    label: "safe metadata",
  },
};

describe("ticket history persistence boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes caller-supplied event identity before persistence and maps the row", async () => {
    repository.createTicketHistoryRow.mockResolvedValue(row());
    const query = vi.fn();

    await expect(createTicketHistory(input, { query })).resolves.toEqual(
      expect.objectContaining({
        ticket_id: "ticket-1",
        history_no: 1,
        event: "COMMENT_CREATED",
        actor_username: "worker",
        to_value: { content: "updated" },
        created_at: "2026-01-02T03:04:05.000Z",
      }),
    );
    expect(repository.createTicketHistoryRow).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "USER_ACTION",
        event: "COMMENT_CREATED",
        metadata: { label: "safe metadata" },
      }),
      { query },
    );
  });

  it("preserves non-object metadata because it cannot contain forged identity fields", async () => {
    repository.createTicketHistoryRow.mockResolvedValue(row());

    await createTicketHistory({ ...input, metadata: ["safe"] });

    expect(repository.createTicketHistoryRow).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: ["safe"] }),
      undefined,
    );
  });

  it("maps an empty persistence result to a conflict", async () => {
    repository.createTicketHistoryRow.mockResolvedValue(null);

    await expect(createTicketHistory(input)).rejects.toMatchObject({
      status: 409,
      message: "Unable to create ticket history.",
    });
  });

  it("propagates repository errors without rewriting their status", async () => {
    const error = Object.assign(new Error("database unavailable"), { status: 503 });
    repository.createTicketHistoryRow.mockRejectedValue(error);

    await expect(createTicketHistory(input)).rejects.toBe(error);
  });

  it("loads histories in repository order and forwards the transaction query", async () => {
    repository.findTicketHistoryRowsByTicketId.mockResolvedValue([row(1), row(2)]);
    const query = vi.fn();

    const histories = await getTicketHistoriesByTicketId("ticket-1", { query });

    expect(histories.map((history) => history.history_no)).toEqual([1, 2]);
    expect(repository.findTicketHistoryRowsByTicketId).toHaveBeenCalledWith(
      "ticket-1",
      { query },
    );
  });
});
