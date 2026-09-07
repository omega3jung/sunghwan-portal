// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { TICKET_ATTACHMENT_LIMITS } from "./demoAttachmentMapping";
import { prepareTicketAttachments } from "./ticketAttachmentPrepareService";

describe("Ticket attachment preparation boundary", () => {
  it("separates files and images into controlled persistence-safe metadata", () => {
    const result = prepareTicketAttachments({
      body: "<p>request</p>",
      files: [
        createFile("evidence.pdf", "application/pdf", 10),
        createFile("screen.png", "image/png", 20),
      ],
    });

    expect(result.files).toEqual([
      expect.objectContaining({
        originalName: "evidence.pdf",
        demoUrl: "/files/demo-pdf.pdf",
        replaced: true,
      }),
    ]);
    expect(result.images).toEqual([
      expect.objectContaining({
        originalName: "screen.png",
        demoUrl: "/files/demo-png.png",
        replaced: true,
      }),
    ]);
    expect(JSON.stringify(result)).not.toContain("data:");
    expect(JSON.stringify(result)).not.toContain("blob:");
  });

  it("replaces inline base64 images while preserving allow-listed demo URLs", () => {
    const result = prepareTicketAttachments({
      body:
        '<p><img src="data:image/png;base64,QUJDRA=="><img src="/files/demo-jpg.jpg"></p>',
      files: [],
    });

    expect(result.body).toBe(
      '<p><img src="/files/demo-png.png"><img src="/files/demo-jpg.jpg"></p>',
    );
    expect(result.images).toEqual([
      expect.objectContaining({ extension: "png", size: 4 }),
    ]);
  });

  it.each([
    ["remote URL", "https://example.com/image.png"],
    ["blob URL", "blob:http://localhost/id"],
    ["file URL", "file:///C:/temp/image.png"],
    ["backslash path", "C:\\temp\\image.png"],
    ["uncontrolled local URL", "/uploads/image.png"],
  ])("rejects a %s in rich text", (_label, src) => {
    expect(() =>
      prepareTicketAttachments({
        body: `<img src="${src}">`,
        files: [],
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it("rejects unsupported inline MIME and selected-file MIME/extension mismatch", () => {
    expect(() =>
      prepareTicketAttachments({
        body: '<img src="data:image/svg+xml;base64,PHN2Zz4=">',
        files: [],
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));

    expect(() =>
      prepareTicketAttachments({
        body: "",
        files: [createFile("renamed.txt", "image/png", 1)],
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it("enforces selected-file count, per-file size, and aggregate size", () => {
    expect(() =>
      prepareTicketAttachments({
        body: "",
        files: Array.from(
          { length: TICKET_ATTACHMENT_LIMITS.maxFileCount + 1 },
          (_, index) => createFile(`${index}.txt`, "text/plain", 1),
        ),
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));

    expect(() =>
      prepareTicketAttachments({
        body: "",
        files: [
          createFile(
            "large.pdf",
            "application/pdf",
            TICKET_ATTACHMENT_LIMITS.maxFileSizeBytes + 1,
          ),
        ],
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));

    expect(() =>
      prepareTicketAttachments({
        body: "",
        files: Array.from({ length: 6 }, (_, index) =>
          createFile(
            `${index}.pdf`,
            "application/pdf",
            9 * 1024 * 1024,
          ),
        ),
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it("enforces inline-image count and size", () => {
    const image = '<img src="data:image/png;base64,QQ==">';
    expect(() =>
      prepareTicketAttachments({
        body: image.repeat(TICKET_ATTACHMENT_LIMITS.maxInlineImageCount + 1),
        files: [],
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));

    const oversizedBase64 = "A".repeat(
      Math.ceil(((TICKET_ATTACHMENT_LIMITS.maxInlineImageSizeBytes + 1) * 4) / 3),
    );
    expect(() =>
      prepareTicketAttachments({
        body: `<img src="data:image/png;base64,${oversizedBase64}">`,
        files: [],
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});

function createFile(name: string, type: string, size: number) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}
