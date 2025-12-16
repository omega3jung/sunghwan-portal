export const US_DOLLARS_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatDollars = (value: string | number): string => {
  const amount = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(amount)) {
    return value as string;
  }

  return US_DOLLARS_FORMATTER.format(amount);
};

export const isNumber = (num: any) => {
  return /^-?[\d.]+(?:e-?\d+)?$/.test(num);
};

export const sanitizeNumber = (value: string): number => {
  const sanitized = value?.replace(/[^0-9.]/g, "");
  const result = Number(sanitized);

  return isNaN(result) ? 0 : result;
};
