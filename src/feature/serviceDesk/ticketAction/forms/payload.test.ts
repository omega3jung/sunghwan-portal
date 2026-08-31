import { describe, expect, it } from "vitest";

import type { PrepareTicketAttachmentsResponse } from "@/lib/application/contracts/serviceDesk";

import { buildTicketActionPayload } from "./payload";
import type { TicketActionDraftFormValues } from "./types";

function createDraftValues(
  overrides: Partial<TicketActionDraftFormValues> = {},
): TicketActionDraftFormValues {
  return {
    actionType: "COMMENT",
    content: "  An update  ",
    attachment: [],
    assigneeUsernames: [],
    categoryId: "",
    targetTicketId: "",
    priority: "",
    riskLevel: "",
    ...overrides,
  };
}

const prepared: PrepareTicketAttachmentsResponse = {
  body: "  Prepared body  ",
  files: [
    {
      originalName: "report.pdf",
      replacedName: "demo-report.pdf",
      extension: "pdf",
      size: 20,
      type: "application/pdf",
      demoUrl: "/files/demo-report.pdf",
      replaced: true,
      reason: "SECURITY_DEMO_REPLACEMENT",
    },
  ],
  images: [
    {
      originalName: "screen.png",
      replacedName: "demo-screen.png",
      extension: "png",
      size: 10,
      type: "image/png",
      demoUrl: "/files/demo-screen.png",
      replaced: true,
      reason: "SECURITY_DEMO_REPLACEMENT",
    },
  ],
};

describe("ticket action payload", () => {
  it("splits raw attachments into files and images", () => {
    const document = new File(["doc"], "report.pdf", {
      type: "application/pdf",
      lastModified: 100,
    });
    const image = new File(["img"], "screen.png", {
      type: "image/png",
      lastModified: 200,
    });

    const payload = buildTicketActionPayload({
      userId: "agent-1",
      values: createDraftValues({ attachment: [document, image] }),
    });

    expect(payload.content).toBe("An update");
    expect(payload.files).toEqual([
      { id: "report.pdf-3-100", name: "report.pdf", size: 3 },
    ]);
    expect(payload.images).toEqual([
      { id: "screen.png-3-200", name: "screen.png", size: 3 },
    ]);
  });

  it("uses the rewritten body and durable metadata after preparation", () => {
    const payload = buildTicketActionPayload({
      userId: "agent-1",
      values: createDraftValues({
        attachment: [new File(["raw"], "raw.txt")],
      }),
      prepared,
    });

    expect(payload.content).toBe("Prepared body");
    expect(payload.files).toEqual([
      {
        id: "demo-report.pdf-20",
        name: "report.pdf",
        size: 20,
        url: "/files/demo-report.pdf",
      },
    ]);
    expect(payload.images).toEqual([
      {
        id: "demo-screen.png-10",
        name: "screen.png",
        size: 10,
        url: "/files/demo-screen.png",
      },
    ]);
  });

  it.each(["APPROVE", "DECLINE"] as const)(
    "never sends attachments for %s",
    (actionType) => {
      const payload = buildTicketActionPayload({
        userId: "agent-1",
        values: createDraftValues({ actionType }),
        prepared,
      });

      expect(payload.files).toEqual([]);
      expect(payload.images).toEqual([]);
    },
  );

  it("normalizes the fields owned by each command", () => {
    expect(
      buildTicketActionPayload({
        userId: "agent-1",
        values: createDraftValues({
          actionType: "ASSIGN",
          assigneeUsernames: ["agent-2"],
          categoryId: "  12  ",
        }),
      }),
    ).toEqual(
      expect.objectContaining({
        assigneeUsernames: ["agent-2"],
        categoryId: "12",
      }),
    );

    expect(
      buildTicketActionPayload({
        userId: "agent-1",
        values: createDraftValues({
          actionType: "MERGE",
          targetTicketId: "  ticket-2  ",
        }),
      }).targetTicketId,
    ).toBe("ticket-2");

    expect(
      buildTicketActionPayload({
        userId: "agent-1",
        values: createDraftValues({
          actionType: "ADJUST",
          priority: "  high  ",
          riskLevel: "   ",
          dueAt: new Date("2026-09-10T00:00:00.000Z"),
        }),
      }),
    ).toEqual(
      expect.objectContaining({
        priority: "high",
        riskLevel: undefined,
        dueAt: "2026-09-10T00:00:00.000Z",
      }),
    );
  });
});
