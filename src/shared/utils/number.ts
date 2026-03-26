/**
 * Checks whether a value is a string that can be converted into a valid number.
 *
 * Use for:
 * - Guarding string inputs before numeric conversion
 * - Detecting numeric values in string-based key-value data
 *
 * @param value - The unknown value to test for numeric string conversion
 * @returns `true` when the value is a string that converts to a non-NaN number, otherwise `false`
 */
export const isNumber = (value: unknown): boolean => {
  return typeof value === "string" && !isNaN(Number(value));
};

/**
 * Removes non-numeric characters except decimal points and converts the result to a number.
 *
 * Use for:
 * - Cleaning formatted currency or amount input before calculation
 * - Normalizing numeric text that may contain separators or symbols
 *
 * @param value - The raw string value that may include non-numeric characters
 * @returns The parsed numeric value, or `0` when the sanitized result is not a valid number
 */
export const sanitizeNumber = (value: string): number => {
  const sanitized = value?.replace(/[^0-9.]/g, "");
  const result = Number(sanitized);

  return isNaN(result) ? 0 : result;
};
