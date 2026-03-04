export const formatCurrency = (
  value: string | number,
  locale = "en-US",
  currency = "USD",
): string => {
  const amount = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(amount)) return String(value);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};
