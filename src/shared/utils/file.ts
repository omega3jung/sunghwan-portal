"use client";

export const makeFile = (text: string, name: string, type = "text/plain") => {
  const blob = new Blob([text], { type });

  return new File([blob], `${name ?? new Date().toISOString()}`, { type });
};

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

export const bytesToKB = (size: number) =>
  Math.round((size / 1024 + Number.EPSILON) * 100) / 100;

export const bytesToMB = (size: number) =>
  Math.round((size / (1024 * 1024) + Number.EPSILON) * 100) / 100;

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
