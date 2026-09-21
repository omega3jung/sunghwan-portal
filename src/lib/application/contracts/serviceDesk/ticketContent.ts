import sanitizeHtml from "sanitize-html";
import { z } from "zod";

/** Persistence accepts prepared images; temporary editor sources must be prepared first. */
export function hasPersistableTicketImages(content: string): boolean {
  let valid = true;
  // Use the existing HTML parser so unquoted attributes and encoded schemes
  // receive the same checks as the editor's ordinary quoted image sources.
  sanitizeHtml(content, {
    transformTags: {
      img: (tagName, attribs) => {
        const src = (attribs.src ?? "").replace(/[\u0000-\u0020]/g, "");
        const srcset = attribs.srcset ?? "";
        if (/^(data|blob):/i.test(src) || /(?:^|[,\s])(data|blob):/i.test(srcset)) {
          valid = false;
        }
        return { tagName, attribs };
      },
    },
  });
  return valid;
}

export const persistedTicketContentSchema = z.string().refine(
  hasPersistableTicketImages,
  "Ticket images must be prepared before saving.",
);

/** Empty editor markup is incomplete; an inline image is meaningful content. */
export function hasMeaningfulTicketContent(content: string): boolean {
  let hasImage = false;
  const text = sanitizeHtml(content, {
    allowedTags: ["img"],
    allowedAttributes: { img: ["src"] },
    // The editor may still contain temporary images. Persistence separately
    // requires prepared sources through hasPersistableTicketImages.
    allowedSchemesByTag: { img: ["http", "https", "data", "blob"] },
    exclusiveFilter: (frame) => {
      if (frame.tag !== "img") return false;
      hasImage ||= !!frame.attribs.src?.trim();
      return true;
    },
  });
  return hasImage || text.replace(/&nbsp;|&#160;/gi, " ").trim().length > 0;
}

export const submittedTicketContentSchema = persistedTicketContentSchema
  .trim()
  .refine(hasMeaningfulTicketContent, "Ticket content is required.");
