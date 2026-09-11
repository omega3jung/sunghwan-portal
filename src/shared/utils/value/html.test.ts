import { describe, expect, it } from "vitest";

import { sanitizeRichText } from "./html";

describe("sanitizeRichText", () => {
  it("removes executable HTML while preserving supported rich text", () => {
    const result = sanitizeRichText(
      '<p onclick="alert(1)"><strong>Details</strong>' +
        '<img src="/files/screenshot.png" onerror="alert(2)">' +
        '<a href="javascript:alert(3)">unsafe</a></p><script>alert(4)</script>',
    );

    expect(result).toContain("<p><strong>Details</strong>");
    expect(result).toContain('<img src="/files/screenshot.png" />');
    expect(result).toContain("<a>unsafe</a>");
    expect(result).not.toMatch(/onclick|onerror|javascript:|script/i);
  });

  it("preserves safe links, inline images, and table structure", () => {
    const result = sanitizeRichText(
      '<a href="https://example.com" target="_blank" rel="noopener">link</a>' +
        '<img src="data:image/png;base64,QQ==" alt="preview">' +
        '<table><tbody><tr><td colspan="2">cell</td></tr></tbody></table>',
    );

    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('src="data:image/png;base64,QQ=="');
    expect(result).toContain('<td colspan="2">cell</td>');
  });

  it("rejects unsupported inline image data formats", () => {
    const result = sanitizeRichText(
      '<img src="data:image/svg+xml;base64,PHN2Zz4=" alt="unsafe">',
    );

    expect(result).toBe('<img alt="unsafe" />');
  });
});
