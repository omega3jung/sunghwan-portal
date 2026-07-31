/**
 * Produces a compact text preview from trusted rich-text HTML.
 *
 * Block boundaries become spaces and the small entity set emitted by the
 * current editor is decoded. This is intentionally not a general HTML parser
 * or sanitizer; callers must not use the result as a security boundary.
 */
export function htmlToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
