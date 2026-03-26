"use client";

/**
 * Creates a browser `File` object from plain text content.
 *
 * Use for:
 * - Generating downloadable text files on the client
 * - Converting exported text content into an uploadable file instance
 *
 * @param text - The raw text content to store in the file
 * @param name - The file name to assign to the generated file
 * @param type - The MIME type that describes the file contents
 * @returns A `File` instance containing the provided text
 */
export const makeFile = (text: string, name: string, type = "text/plain") => {
  const blob = new Blob([text], { type });

  return new File([blob], `${name ?? new Date().toISOString()}`, { type });
};

/**
 * Converts a base64 data URL into a browser `File` object.
 *
 * Use for:
 * - Turning canvas or image preview data into uploadable files
 * - Reconstructing files from stored data URL strings
 *
 * @param dataurl - The full data URL containing MIME metadata and base64-encoded content
 * @param filename - The file name to assign to the generated file
 * @returns A `File` instance created from the decoded binary content
 */
export const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

/**
 * Converts a byte count into kilobytes rounded to two decimal places.
 *
 * Use for:
 * - Displaying file sizes in upload UIs
 * - Normalizing byte-based values for compact text output
 *
 * @param size - The size in bytes to convert
 * @returns The size expressed in kilobytes with two-decimal precision
 */
export const bytesToKB = (size: number) =>
  Math.round((size / 1024 + Number.EPSILON) * 100) / 100;

/**
 * Converts a byte count into megabytes rounded to two decimal places.
 *
 * Use for:
 * - Showing attachment limits in megabytes
 * - Reporting aggregated file sizes in a user-friendly unit
 *
 * @param size - The size in bytes to convert
 * @returns The size expressed in megabytes with two-decimal precision
 */
export const bytesToMB = (size: number) =>
  Math.round((size / (1024 * 1024) + Number.EPSILON) * 100) / 100;

/**
 * Validates a file list against maximum count and total size constraints.
 *
 * Use for:
 * - Enforcing upload rules before submitting files
 * - Showing specific validation feedback for count or size errors
 *
 * @param files - The selected files to validate
 * @param maxCount - The maximum number of files allowed in the selection
 * @param maxSizeMB - The maximum combined file size allowed, in megabytes
 * @returns `"count"` when the file count is too high, `"size"` when the combined size is too large, or `null` when valid
 */
export const validateFiles = (
  files: File[],
  maxCount: number,
  maxSizeMB: number,
): "count" | "size" | null => {
  if (files.length > maxCount) {
    return "count";
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  const total = files.reduce((acc, f) => acc + f.size, 0);

  if (total > maxBytes) {
    return "size";
  }

  return null;
};
