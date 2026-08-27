import { describe, expect, it } from "vitest";

import { ticketCreateRequestSchema } from "./ticketDto";

describe("ticket create DTO validation", () => {
  it("rejects invalid direct API priority and risk enums", () => {
    const base = {
      categoryId: 1,
      subject: "Subject",
      body: "Body",
      dueAt: "2099-01-01T00:00:00.000Z",
      email: { to: [], cc: [], bcc: [] },
      files: [],
      images: [],
    };
    expect(
      ticketCreateRequestSchema.safeParse({
        ...base,
        priority: "highest",
      }).success,
    ).toBe(false);
    expect(
      ticketCreateRequestSchema.safeParse({
        ...base,
        riskLevel: "severe",
      }).success,
    ).toBe(false);
  });
});
