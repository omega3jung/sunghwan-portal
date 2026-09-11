import sanitizeHtml from "sanitize-html";

const SUPPORTED_INLINE_IMAGE_DATA_URL_PATTERN =
  /^data:image\/(?:jpeg|png|gif|webp);base64,[a-z0-9+/=\s]+$/i;

const RICH_TEXT_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "table",
    "colgroup",
    "col",
    "tbody",
    "thead",
    "tfoot",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    th: ["colspan", "rowspan", "colwidth"],
    td: ["colspan", "rowspan", "colwidth"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  transformTags: {
    img: (tagName, attributes) => {
      if (
        attributes.src?.startsWith("data:") &&
        !SUPPORTED_INLINE_IMAGE_DATA_URL_PATTERN.test(attributes.src)
      ) {
        const { src: _unsafeSource, ...safeAttributes } = attributes;
        return { tagName, attribs: safeAttributes };
      }

      return { tagName, attribs: attributes };
    },
  },
};

/** Sanitizes untrusted rich-text HTML while preserving the current editor schema. */
export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, RICH_TEXT_SANITIZE_OPTIONS);
}

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
