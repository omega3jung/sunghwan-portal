import { describe, expect, it } from "vitest";

import type { TicketActionCommandRequest } from "@/lib/application/contracts/serviceDesk";
import type { ServiceDeskTicketViewRow } from "@/server/data/serviceDesk/ticket/ticketRow";

import {
  assertAdminActionAllowed,
  assertApprovalActionAllowed,
  assertRequesterActionAllowed,
  assertRequesterOrAdmin,
  assertTicketActionAllowed,
  assertTicketUpdated,
  assertWorkAssignee,
  assertWorkAssigneeOrAdmin,
  compactHistoryObject,
  normalizeAssigneeUsernames,
  requireCurrentApprovalStepId,
  requireNextTicketStatus,
  validateApprovalActionPayload,
  validateTicketActionPayload,
} from "./ticketActionRules";

const payload = (
  overrides: Partial<TicketActionCommandRequest> = {},
): TicketActionCommandRequest => ({ content: "  reason  ", ...overrides });

const ticket = (
  overrides: Partial<ServiceDeskTicketViewRow> = {},
) =>
  ({
    tk_status: "Working",
    tk_requester_username: "requester",
    tk_approval_step_id: null,
    tk_assignee_usernames: ["worker"],
    ...overrides,
  }) as ServiceDeskTicketViewRow;

describe("ticket action payload validation", () => {
  it("uses the path as authority and rejects a conflicting body action", () => {
    expect(() =>
      validateTicketActionPayload("comment", payload({ actionType: "NOTE" })),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it.each(["comment", "note", "assign", "merge"] as const)(
    "requires content for %s",
    (action) => {
      expect(() =>
        validateTicketActionPayload(action, payload({ content: "  " })),
      ).toThrow(expect.objectContaining({ status: 400 }));
    },
  );

  it("requires action-specific assignee and merge target input", () => {
    expect(() => validateTicketActionPayload("assign", payload())).toThrow(
      expect.objectContaining({ status: 400 }),
    );
    expect(() => validateTicketActionPayload("merge", payload())).toThrow(
      expect.objectContaining({ status: 400 }),
    );
  });

  it.each(["blob:https://portal.local/1", "data:text/plain;base64,QQ=="])(
    "rejects browser-local attachment URL %s",
    (url) => {
      expect(() =>
        validateTicketActionPayload(
          "comment",
          payload({
            files: [{ id: "1", name: "file.txt", size: 1, url }],
          }),
        ),
      ).toThrow(expect.objectContaining({ status: 400 }));
    },
  );

  it("normalizes prepared attachments and keeps durable remote URLs", () => {
    const result = validateTicketActionPayload(
      "comment",
      payload({
        files: [
          {
            id: "1",
            name: "  evidence.pdf  ",
            size: 10,
            url: "  https://files.example/evidence.pdf  ",
          },
        ],
      }),
    );

    expect(result.files).toEqual([
      {
        index: 0,
        type: "file",
        name: "evidence.pdf",
        url: "https://files.example/evidence.pdf",
        active: true,
      },
    ]);
    expect(result.historyMetadata).toEqual(
      expect.objectContaining({
        actionType: "COMMENT",
        files: [expect.objectContaining({ name: "evidence.pdf" })],
      }),
    );
  });

  it.each([
    ["priority", "blocker", "Invalid priority."],
    ["riskLevel", "severe", "Invalid risk level."],
    ["dueAt", "not-a-date", "Invalid due date."],
  ] as const)("rejects invalid %s", (field, value, message) => {
    expect(() =>
      validateTicketActionPayload("adjust", payload({ [field]: value })),
    ).toThrow(expect.objectContaining({ status: 400, message }));
  });

  it("normalizes valid planning fields and canonical assignees", () => {
    const result = validateTicketActionPayload(
      "assign",
      payload({
        assigneeUsernames: [" worker ", "", "worker", " second "],
        priority: "high",
        riskLevel: "critical",
        dueAt: "2026-03-01T09:00:00+09:00",
      }),
    );

    expect(result.assigneeUsernames).toEqual(["worker", "second"]);
    expect(result).toEqual(
      expect.objectContaining({
        priority: "high",
        riskLevel: "critical",
        dueAt: "2026-03-01T00:00:00.000Z",
      }),
    );
  });
});

describe("approval payload validation", () => {
  it("returns trimmed text for the matching approval action", () => {
    expect(
      validateApprovalActionPayload("approve", {
        actionType: "APPROVE",
        content: "  approved  ",
      }),
    ).toBe("approved");
  });

  it("rejects path mismatches, empty content, attachments, and inline images", () => {
    expect(() =>
      validateApprovalActionPayload("approve", {
        actionType: "DECLINE",
        content: "reason",
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
    expect(() =>
      validateApprovalActionPayload("approve", { content: " " }),
    ).toThrow(expect.objectContaining({ status: 400 }));
    expect(() =>
      validateApprovalActionPayload("approve", {
        content: "reason",
        files: [{ id: "1", name: "a.txt", size: 1 }],
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
    expect(() =>
      validateApprovalActionPayload("approve", {
        content: '<p>reason<img src="https://files.example/a.png"></p>',
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});

describe("ticket action actor and phase boundaries", () => {
  it("authorizes work assignees only after approval routing has ended", () => {
    expect(() => assertWorkAssignee(ticket(), "worker")).not.toThrow();
    expect(() =>
      assertWorkAssignee(ticket({ tk_approval_step_id: 10 }), "worker"),
    ).toThrow(expect.objectContaining({ status: 403 }));
    expect(() => assertWorkAssigneeOrAdmin(ticket(), "other", true)).not.toThrow();
  });

  it("authorizes approval decisions only in Approval with an active step", () => {
    const approvalTicket = ticket({
      tk_status: "Approval",
      tk_approval_step_id: 10,
      tk_assignee_usernames: [" approver ", "approver"],
    });

    expect(() => assertApprovalActionAllowed(approvalTicket, "approver")).not.toThrow();
    expect(() =>
      assertApprovalActionAllowed(
        ticket({ ...approvalTicket, tk_status: "Working" }),
        "approver",
      ),
    ).toThrow(expect.objectContaining({ status: 403 }));
    expect(requireCurrentApprovalStepId(approvalTicket)).toBe(10);
    expect(() => requireCurrentApprovalStepId(ticket())).toThrow(
      expect.objectContaining({ status: 409 }),
    );
  });

  it("applies requester and administrator overrides at the intended boundaries", () => {
    expect(() => assertRequesterOrAdmin(ticket(), "other", true)).not.toThrow();
    expect(() => assertRequesterOrAdmin(ticket(), "other", false)).toThrow(
      expect.objectContaining({ status: 403 }),
    );
    expect(() => assertRequesterActionAllowed(ticket(), "requester")).not.toThrow();
    expect(() => assertRequesterActionAllowed(ticket(), "other")).toThrow(
      expect.objectContaining({ status: 403 }),
    );
    expect(() => assertAdminActionAllowed(false, "admin only")).toThrow(
      expect.objectContaining({ status: 403, message: "admin only" }),
    );
  });

  it("converts invalid workflow state and failed conditional writes to conflicts", () => {
    expect(() => assertTicketActionAllowed("reopen", "Working")).toThrow(
      expect.objectContaining({ status: 409 }),
    );
    expect(requireNextTicketStatus("reopen", "Resolved")).toBe("Working");
    expect(() => requireNextTicketStatus("comment", "Working")).toThrow(
      expect.objectContaining({ status: 409 }),
    );
    expect(() => assertTicketUpdated(null, "concurrent change")).toThrow(
      expect.objectContaining({ status: 409, message: "concurrent change" }),
    );
  });

  it("trims, removes empty values, and deduplicates persisted assignees", () => {
    expect(
      normalizeAssigneeUsernames([" worker ", "", null, "worker", "second"]),
    ).toEqual(["worker", "second"]);
  });

  it("compacts history metadata without dropping explicit null", () => {
    expect(compactHistoryObject({ dueAt: null, omitted: undefined })).toEqual({
      dueAt: null,
    });
  });
});
