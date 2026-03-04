export const isNumber = (value: unknown): boolean => {
  return typeof value === "string" && !isNaN(Number(value));
};

export const sanitizeNumber = (value: string): number => {
  const sanitized = value?.replace(/[^0-9.]/g, "");
  const result = Number(sanitized);

  return isNaN(result) ? 0 : result;
};
