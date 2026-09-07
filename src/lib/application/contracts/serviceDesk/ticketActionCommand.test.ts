import { describe, expect, it } from "vitest";

import {
  canExecuteTicketAction,
  isTicketActionPath,
  isTicketApprovalActionPath,
  isTicketGeneralActionPath,
  resolveTicketActionExecutionMode,
  resolveTicketActionNextStatus,
} from "./ticketActionCommand";

describe("ticket action execution policy", () => {
  it("keeps approval actions phase-bound while expanding supported admin actions", () => {
    expect(resolveTicketActionExecutionMode("approve", true)).toBe("approve");
    expect(resolveTicketActionExecutionMode("assign", false)).toBe("assign");
    expect(resolveTicketActionExecutionMode("assign", true)).toBe(
      "assignAdminOverride",
    );
    expect(resolveTicketActionExecutionMode("adjust", true)).toBe(
      "adjustAdminOverride",
    );
    expect(resolveTicketActionExecutionMode("merge", true)).toBe(
      "mergeAdminOverride",
    );
  });

  it.each([
    ["approve", "Approval", true],
    ["approve", "Working", false],
    ["assign", "Approval", false],
    ["assignAdminOverride", "Approval", true],
    ["adjustAdminOverride", "Closed", true],
    ["adjust", "Closed", false],
    ["merge", "Declined", false],
    ["mergeAdminOverride", "Declined", true],
    ["reopen", "Resolved", true],
    ["reopen", "Closed", false],
    ["resubmit", "Rejected", true],
    ["cancel", "Resolved", false],
  ] as const)(
    "evaluates %s against %s as %s",
    (actionMode, status, expected) => {
      expect(canExecuteTicketAction(actionMode, status)).toBe(expected);
    },
  );

  it.each([
    ["decline", "Approval", "Declined"],
    ["assign", "Pending", "Working"],
    ["assign", "Assigned", undefined],
    ["reject", "Working", "Rejected"],
    ["reject", "Rejected", undefined],
    ["mergeAdminOverride", "Resolved", "Closed"],
    ["mergeAdminOverride", "Closed", undefined],
    ["reopen", "Resolved", "Working"],
    ["cancel", "Rejected", "Closed"],
  ] as const)(
    "%s resolves %s to %s",
    (actionMode, status, expected) => {
      expect(resolveTicketActionNextStatus(actionMode, status)).toBe(expected);
    },
  );

  it("distinguishes supported approval, general, and unknown action paths", () => {
    expect(isTicketActionPath("approve")).toBe(true);
    expect(isTicketApprovalActionPath("approve")).toBe(true);
    expect(isTicketGeneralActionPath("approve")).toBe(false);
    expect(isTicketGeneralActionPath("assignSelf")).toBe(true);
    expect(isTicketActionPath("archive")).toBe(false);
  });
});
