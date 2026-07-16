import {
  getDemoUrlByExtension,
  getReplacedNameFromDemoUrl,
  TICKET_ATTACHMENT_EXTENSION_SET,
  TICKET_ATTACHMENT_LIMITS,
  TICKET_INLINE_IMAGE_EXTENSION_SET,
} from "./demoAttachmentMapping";
import {
  PrepareTicketAttachmentsResponseDto,
  TICKET_ATTACHMENT_REPLACEMENT_REASON,
  TicketAttachmentExtension,
  TicketAttachmentImageExtension,
  TicketAttachmentPrepareInput,
  TicketPreparedAttachmentDto,
  TicketPreparedInlineImageDto,
} from "./ticketAttachmentPrepareDto";

const IMAGE_SRC_PATTERN =
  /<img\b([^>]*?)\bsrc\s*=\s*(["'])(.*?)\2([^>]*)>/gi;
const DATA_IMAGE_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i;

const IMAGE_EXTENSION_BY_MIME_TYPE: Record<string, TicketAttachmentImageExtension> =
  {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };

export function prepareTicketAttachments({
  body,
  files,
}: TicketAttachmentPrepareInput): PrepareTicketAttachmentsResponseDto {
  validateSelectedFileLimits(files);

  const preparedFiles: TicketPreparedAttachmentDto[] = [];
  const preparedImages: TicketPreparedInlineImageDto[] = [];

  files.forEach((file) => {
    const prepared = prepareSelectedFile(file);

    if (isImageAttachment(prepared.extension, prepared.type)) {
      preparedImages.push(prepared as TicketPreparedInlineImageDto);
      return;
    }

    preparedFiles.push(prepared);
  });

  const inlineResult = replaceInlineImages(body);

  preparedImages.push(...inlineResult.images);

  if (/data:image\//i.test(inlineResult.body)) {
    throw createStatusError("Base64 images are not allowed in ticket body.", 400);
  }

  return {
    body: inlineResult.body,
    files: preparedFiles,
    images: preparedImages,
  };
}

function validateSelectedFileLimits(files: File[]) {
  if (files.length > TICKET_ATTACHMENT_LIMITS.maxFileCount) {
    throw createStatusError("Too many ticket attachment files.", 400);
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > TICKET_ATTACHMENT_LIMITS.maxTotalFileSizeBytes) {
    throw createStatusError("Ticket attachment files are too large.", 400);
  }
}

function prepareSelectedFile(file: File): TicketPreparedAttachmentDto {
  const originalName = normalizeFileName(file.name);
  const extension = resolveFileExtension(originalName);

  if (
    file.type.toLowerCase().startsWith("image/") &&
    !TICKET_INLINE_IMAGE_EXTENSION_SET.has(extension)
  ) {
    throw createStatusError("Unsupported ticket attachment image type.", 400);
  }

  validateFileSize(file.size, "Ticket attachment file is too large.");

  const demoUrl = getDemoUrlByExtension(extension);

  return {
    originalName,
    replacedName: getReplacedNameFromDemoUrl(demoUrl),
    extension,
    size: file.size,
    type: file.type || "application/octet-stream",
    demoUrl,
    replaced: true,
    reason: TICKET_ATTACHMENT_REPLACEMENT_REASON,
  };
}

function replaceInlineImages(body: string): {
  body: string;
  images: TicketPreparedInlineImageDto[];
} {
  const images: TicketPreparedInlineImageDto[] = [];
  let inlineImageIndex = 0;
  let inlineImageTotalSize = 0;

  const preparedBody = body.replace(
    IMAGE_SRC_PATTERN,
    (match, beforeSrc: string, quote: string, rawSrc: string, afterSrc: string) => {
      const src = rawSrc.trim();

      if (isDemoFileUrl(src)) {
        return match;
      }

      if (!src.toLowerCase().startsWith("data:image/")) {
        validateNonDataImageSrc(src);
        return match;
      }

      const parsed = parseDataImageSrc(src);

      inlineImageIndex += 1;

      if (inlineImageIndex > TICKET_ATTACHMENT_LIMITS.maxInlineImageCount) {
        throw createStatusError("Too many inline ticket images.", 400);
      }

      validateInlineImageSize(parsed.size);
      inlineImageTotalSize += parsed.size;

      if (
        inlineImageTotalSize >
        TICKET_ATTACHMENT_LIMITS.maxTotalInlineImageSizeBytes
      ) {
        throw createStatusError("Inline ticket images are too large.", 400);
      }

      const originalName = `inline-image-${inlineImageIndex}.${parsed.extension}`;
      const demoUrl = getDemoUrlByExtension(parsed.extension);

      images.push({
        originalName,
        replacedName: getReplacedNameFromDemoUrl(demoUrl),
        extension: parsed.extension,
        size: parsed.size,
        type: parsed.mimeType,
        demoUrl,
        replaced: true,
        reason: TICKET_ATTACHMENT_REPLACEMENT_REASON,
      });

      return `<img${beforeSrc}src=${quote}${demoUrl}${quote}${afterSrc}>`;
    },
  );

  return {
    body: preparedBody,
    images,
  };
}

function normalizeFileName(fileName: string) {
  const normalizedName = fileName.trim();

  if (!normalizedName) {
    throw createStatusError("Ticket attachment file name is required.", 400);
  }

  if (normalizedName.length > TICKET_ATTACHMENT_LIMITS.maxFileNameLength) {
    throw createStatusError("Ticket attachment file name is too long.", 400);
  }

  return normalizedName;
}

function resolveFileExtension(fileName: string): TicketAttachmentExtension {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension || extension === fileName.toLowerCase()) {
    throw createStatusError("Ticket attachment file extension is required.", 400);
  }

  if (!TICKET_ATTACHMENT_EXTENSION_SET.has(extension)) {
    throw createStatusError("Unsupported ticket attachment file type.", 400);
  }

  return extension as TicketAttachmentExtension;
}

function validateFileSize(size: number, message: string) {
  if (size > TICKET_ATTACHMENT_LIMITS.maxFileSizeBytes) {
    throw createStatusError(message, 400);
  }
}

function validateInlineImageSize(size: number) {
  if (size > TICKET_ATTACHMENT_LIMITS.maxInlineImageSizeBytes) {
    throw createStatusError("Inline ticket image is too large.", 400);
  }
}

function parseDataImageSrc(src: string) {
  const match = src.match(DATA_IMAGE_PATTERN);

  if (!match) {
    throw createStatusError("Invalid inline ticket image.", 400);
  }

  const mimeType = match[1].toLowerCase();
  const extension = IMAGE_EXTENSION_BY_MIME_TYPE[mimeType];

  if (!extension || !TICKET_INLINE_IMAGE_EXTENSION_SET.has(extension)) {
    throw createStatusError("Unsupported inline ticket image type.", 400);
  }

  return {
    mimeType,
    extension,
    size: calculateBase64ByteSize(match[2]),
  };
}

function calculateBase64ByteSize(value: string) {
  const normalizedValue = value.replace(/\s/g, "");
  const padding = normalizedValue.endsWith("==")
    ? 2
    : normalizedValue.endsWith("=")
      ? 1
      : 0;

  return Math.max(0, Math.floor((normalizedValue.length * 3) / 4) - padding);
}

function validateNonDataImageSrc(src: string) {
  if (!src) {
    throw createStatusError("Ticket image src is required.", 400);
  }

  if (src.toLowerCase().startsWith("blob:")) {
    throw createStatusError("Blob image URLs are not allowed.", 400);
  }

  if (/^https?:\/\//i.test(src)) {
    throw createStatusError("Remote image URLs are not allowed.", 400);
  }

  if (/^file:/i.test(src) || /\\/.test(src) || /^[a-z]:\//i.test(src)) {
    throw createStatusError("Local file image paths are not allowed.", 400);
  }

  throw createStatusError("Only demo ticket image URLs are allowed.", 400);
}

function isDemoFileUrl(value: string) {
  return /^\/files\/demo-[a-z0-9-]+\.[a-z0-9]+$/i.test(value);
}

function isImageAttachment(
  extension: TicketAttachmentExtension,
  mimeType: string,
) {
  return (
    TICKET_INLINE_IMAGE_EXTENSION_SET.has(extension) &&
    (mimeType === "application/octet-stream" ||
      mimeType.toLowerCase().startsWith("image/"))
  );
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
