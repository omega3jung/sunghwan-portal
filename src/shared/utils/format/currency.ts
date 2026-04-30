/**
 * Formats a numeric input as a localized currency string.
 *
 * Use for:
 * - Displaying prices or totals in UI text
 * - Converting numeric form values into locale-aware currency output
 *
 * @param value - The numeric value to format, provided as a number or numeric string
 * @param locale - The locale code that controls separators, grouping, and symbol placement
 * @param currency - The ISO currency code to render in the formatted output
 * @returns A formatted currency string, or the original value as text when parsing fails
 */
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
