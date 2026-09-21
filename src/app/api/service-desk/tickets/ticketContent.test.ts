import { describe, expect, it } from "vitest";

import { ticketMutateRequestPayloadSchema } from "@/feature/serviceDesk/ticket/write";
import { ticketDraftFormSchema } from "@/feature/serviceDesk/ticketDraft/forms";
import { requesterUpdateTicketRequestSchema } from "@/lib/application/contracts/serviceDesk/ticketRequesterUpdate";

const persistedContentSchemas = [
  ["ticket create", ticketMutateRequestPayloadSchema.shape.body],
  ["requester update", requesterUpdateTicketRequestSchema.shape.content],
  ["draft create/update", ticketDraftFormSchema.shape.body],
] as const;

describe.each(persistedContentSchemas)("%s image persistence boundary", (_name, schema) => {
  it("accepts a prepared inline image without text", () => {
    expect(schema.safeParse('<img src="/files/demo-image.png">').success).toBe(true);
  });

  it.each([
    '<img src="data:image/png;base64,aGVsbG8=">',
    "<img src='blob:https://portal.example/image'>",
    '<IMG SRC=DaTa:image/png;base64,aGVsbG8=>',
    '<img src="&#100;ata:image/png;base64,aGVsbG8=">',
    '<img src="blob&#58;https://portal.example/image">',
    '<img src="/files/demo-image.png" srcset="data:image/png;base64,aGVsbG8= 2x">',
  ])("rejects temporary image sources in %s", (content) => {
    expect(schema.safeParse(content).success).toBe(false);
  });

  it("preserves prepared images and ordinary prose mentioning data URLs", () => {
    const content = '<p>Do not paste data:image URLs.</p><img src="/files/demo-image.png">';
    expect(schema.parse(content)).toBe(content);
  });
});

describe.each(persistedContentSchemas.slice(0, 2))("%s complete content boundary", (_name, schema) => {
  it.each([null, "", " \n\t", "<p></p>", "<p><br></p>", "<p>&nbsp;&#160;&#xA0;</p>", "<img>", '<img src="javascript:alert(1)">', "<script>text</script>"])("rejects incomplete content %s", (content) => {
    expect(schema.safeParse(content).success).toBe(false);
  });
});
