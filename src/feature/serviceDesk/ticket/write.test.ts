import { describe, expect, it } from "vitest";

import type { PrepareTicketAttachmentsResponse } from "@/lib/application/contracts/serviceDesk";

import {
  type CreateTicketInput,
  createTicketSchema,
  toTicketMutateRequestPayload,
} from "./write";

const attachment = {
  originalName: " report.PDF ",
  replacedName: " demo-report.PDF ",
  extension: " PDF ",
  size: 42,
  type: " application/pdf ",
  demoUrl: " /files/demo-report.pdf ",
  replaced: true as const,
  reason: "SECURITY_DEMO_REPLACEMENT" as const,
};

function createInput(overrides: Partial<CreateTicketInput> = {}): CreateTicketInput {
  return {
    category: "12",
    subject: "Printer unavailable",
    body: "Please investigate",
    dueAt: new Date("2026-09-10T00:00:00.000Z"),
    priority: "HIGH",
    riskLevel: "unexpected",
    email: { to: ["agent@example.com"], cc: [], bcc: [] },
    requester: {
      id: "requester-1",
      email: "requester@example.com",
      name: "Requester",
    },
    attachment: [attachment],
    ...overrides,
  };
}

describe("ticket write boundary", () => {
  it.each([undefined, "", "0", "-1", "1.5", "not-a-number"])(
    "rejects invalid category id %s",
    (category) => {
      expect(
        createTicketSchema.safeParse(createInput({ category })).success,
      ).toBe(false);
    },
  );

  it("normalizes IDs, enums, dates, and unprepared attachment metadata", () => {
    expect(toTicketMutateRequestPayload(createInput())).toEqual({
      categoryId: 12,
      subject: "Printer unavailable",
      body: "Please investigate",
      dueAt: "2026-09-10T00:00:00.000Z",
      priority: "high",
      riskLevel: null,
      email: { to: ["agent@example.com"], cc: [], bcc: [] },
      files: [
        {
          originalName: "report.PDF",
          replacedName: "demo-report.PDF",
          extension: "pdf",
          size: 42,
          type: "application/pdf",
          demoUrl: "/files/demo-report.pdf",
          replaced: true,
          reason: "SECURITY_DEMO_REPLACEMENT",
        },
      ],
      images: [],
    });
  });

  it("lets prepared attachments replace the body and raw metadata", () => {
    const prepared: PrepareTicketAttachmentsResponse = {
      body: '<p><img src="/files/demo-screen.png"></p>',
      files: [],
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

    const payload = toTicketMutateRequestPayload(createInput(), prepared);

    expect(payload.body).toBe(prepared.body);
    expect(payload.files).toEqual([]);
    expect(payload.images).toEqual(prepared.images);
  });

  it("throws before transport when a category cannot become a positive integer", () => {
    expect(() =>
      toTicketMutateRequestPayload(createInput({ category: "1.5" })),
    ).toThrow("Invalid ticket category id.");
  });
});
