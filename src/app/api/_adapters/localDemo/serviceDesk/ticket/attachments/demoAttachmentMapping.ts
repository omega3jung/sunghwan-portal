import type {
  TicketAttachmentExtension,
  TicketAttachmentImageExtension,
} from "@/lib/application/contracts/serviceDesk";

/** File extensions accepted by the LOCAL attachment preparation boundary. */
export const ALLOWED_TICKET_ATTACHMENT_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "txt",
  "log",
  "csv",
  "json",
  "xlsx",
  "docx",
  "pptx",
  "pdf",
  "zip",
  "7z",
] as const satisfies readonly TicketAttachmentExtension[];

/** Inline-image extensions accepted by the LOCAL attachment preparation boundary. */
export const TICKET_INLINE_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
] as const satisfies readonly TicketAttachmentImageExtension[];

/** Controlled demo resource selected for each accepted attachment extension. */
export const DEMO_FILE_BY_EXTENSION = {
  jpg: "/files/demo-jpg.jpg",
  jpeg: "/files/demo-jpg.jpg",
  png: "/files/demo-png.png",
  gif: "/files/demo-gif.gif",
  webp: "/files/demo-webp.webp",
  txt: "/files/demo-txt.txt",
  log: "/files/demo-log.log",
  csv: "/files/demo-csv.csv",
  json: "/files/demo-json.json",
  xlsx: "/files/demo-xlsx.xlsx",
  docx: "/files/demo-docx.docx",
  pptx: "/files/demo-pptx.pptx",
  pdf: "/files/demo-pdf.pdf",
  zip: "/files/demo-zip.zip",
  "7z": "/files/demo-7z.7z",
} as const satisfies Record<TicketAttachmentExtension, string>;

/** Defines ticket attachment extension set used by the server-side LOCAL ticket adapter. */
export const TICKET_ATTACHMENT_EXTENSION_SET = new Set<string>(
  ALLOWED_TICKET_ATTACHMENT_EXTENSIONS,
);

/** Defines ticket inline image extension set used by the server-side LOCAL ticket adapter. */
export const TICKET_INLINE_IMAGE_EXTENSION_SET = new Set<string>(
  TICKET_INLINE_IMAGE_EXTENSIONS,
);

/** Upload limits enforced by the controlled LOCAL attachment replacement. */
export const TICKET_ATTACHMENT_LIMITS = {
  // TODO: Move these demo-mode limits to a tenant/service-desk settings source.
  maxFileCount: 10,
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxTotalFileSizeBytes: 50 * 1024 * 1024,
  maxInlineImageCount: 20,
  maxInlineImageSizeBytes: 5 * 1024 * 1024,
  maxTotalInlineImageSizeBytes: 20 * 1024 * 1024,
  maxFileNameLength: 200,
} as const;

/** Browser accept string derived from supported LOCAL attachment extensions. */
export const TICKET_ATTACHMENT_ACCEPT =
  ALLOWED_TICKET_ATTACHMENT_EXTENSIONS.map((extension) => `.${extension}`).join(
    ",",
  );

/** Returns demo url by extension from the server-side LOCAL ticket adapter. */
export function getDemoUrlByExtension(extension: TicketAttachmentExtension) {
  return DEMO_FILE_BY_EXTENSION[extension];
}

/** Returns replaced name from demo url from the server-side LOCAL ticket adapter. */
export function getReplacedNameFromDemoUrl(demoUrl: string) {
  return demoUrl.split("/").pop() ?? "demo-file";
}
