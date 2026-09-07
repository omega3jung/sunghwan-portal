import { describe, expect, it } from "vitest";

import { ticketActionDraftFormSchema } from "./schema";
import type { TicketActionDraftFormValues } from "./types";

function createDraftValues(
  overrides: Partial<TicketActionDraftFormValues> = {},
): TicketActionDraftFormValues {
  return {
    actionType: "COMMENT",
    content: "A useful update",
    attachment: [],
    assigneeUsernames: [],
    categoryId: "",
    targetTicketId: "",
    priority: "",
    riskLevel: "",
    ...overrides,
  };
}

describe("ticket action form validation", () => {
  it("requires meaningful content for every action", () => {
    const result = ticketActionDraftFormSchema.safeParse(
      createDraftValues({ content: "   " }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["content"],
          message: "actionTool.validation.contentRequired",
        }),
      ]),
    );
  });

  it("requires at least one assignee for ASSIGN", () => {
    const result = ticketActionDraftFormSchema.safeParse(
      createDraftValues({ actionType: "ASSIGN" }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["assigneeUsernames"] }),
      ]),
    );
  });

  it("requires a non-blank merge target for MERGE", () => {
    const result = ticketActionDraftFormSchema.safeParse(
      createDraftValues({ actionType: "MERGE", targetTicketId: "  " }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ["targetTicketId"] }),
      ]),
    );
  });

  it("accepts command-specific fields when their invariants are satisfied", () => {
    expect(
      ticketActionDraftFormSchema.safeParse(
        createDraftValues({
          actionType: "ASSIGN",
          assigneeUsernames: ["agent-1"],
        }),
      ).success,
    ).toBe(true);
    expect(
      ticketActionDraftFormSchema.safeParse(
        createDraftValues({
          actionType: "MERGE",
          targetTicketId: "ticket-2",
        }),
      ).success,
    ).toBe(true);
  });
});
